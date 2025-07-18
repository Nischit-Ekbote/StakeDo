use anchor_lang::prelude::*;

declare_id!("2fakZCn8BtJsuqAeH7N9cHYxwMyMmZjYjXvjjStTTYTg");

#[program]
pub mod stake_do {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.authority = ctx.accounts.user.key();
        user_account.todo_count = 0;
        user_account.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn initialize_todo(ctx: Context<InitializeTodo>,todo_id:u64, title: String, description: String, deadline: Option<i64>) -> Result<()> {
        let todo_account = &mut ctx.accounts.todo_account;
        todo_account.todo_id = todo_id;
        todo_account.authority = ctx.accounts.user.key();
        todo_account.title = title;
        todo_account.description = description;
        todo_account.deadline = deadline;
        todo_account.updated_at = None;
        todo_account.created_at = Clock::get()?.unix_timestamp;
        todo_account.is_completed = false ;

        Ok(())
    }

    pub fn complete_todo(ctx: Context<CompleteTodo>, todo_id:u64 ) -> Result<()> {
        let todo_account = &mut ctx.accounts.todo_account;
        require!(!todo_account.is_completed, StakeDoError::AlreadyCompleted);

        todo_account.is_completed = true;
        todo_account.updated_at = Some(Clock::get()?.unix_timestamp);
        Ok(())
    }

    pub fn delete_todo(ctx: Context<DeleteTodo>, todo_id:u64) -> Result<()> {
        let todo = &mut ctx.accounts.todo_account;
        require!(todo.is_completed, StakeDoError::TodoNotCompleted);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}


#[account]
pub struct UserAccount {
    pub authority: Pubkey,
    pub created_at: i64,
    pub todo_count: u64,
}


#[derive(Accounts)]
#[instruction(todo_id: u64)]
pub struct InitializeTodo<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + 420,
        seeds = [b"todo", user.key().as_ref(), &todo_id.to_le_bytes()],
        bump
    )]
    pub todo_account: Account<'info, TodoAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(todo_id: u64)]
pub struct CompleteTodo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority,
        seeds = [b"todo", authority.key().as_ref(), &todo_id.to_le_bytes()],
        bump
    )]
    pub todo_account: Account<'info, TodoAccount>,
}

#[derive(Accounts)]
#[instruction(todo_id: u64)]
pub struct DeleteTodo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority,
        close = authority,
        seeds = [b"todo", authority.key().as_ref(), &todo_id.to_le_bytes()],
        bump
    )]
    pub todo_account: Account<'info, TodoAccount>,
}

#[account]
pub struct TodoAccount {
    pub todo_id: u64,
    pub authority: Pubkey,
    pub created_at: i64,
    pub title: String,
    pub description: String,
    pub deadline: Option<i64>,
    pub updated_at: Option<i64>,
    pub is_completed: bool,
}

#[error_code]
pub enum StakeDoError {
    #[msg("Todo already completed.")]
    AlreadyCompleted,
    #[msg("Todo Not Completed.")]
    TodoNotCompleted,
}


