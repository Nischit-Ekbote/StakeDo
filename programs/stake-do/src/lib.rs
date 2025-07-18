use anchor_lang::prelude::*;
use std::str::FromStr;

const APP_OWNER: &str = "3qN3UWgALSzwV2gpsFv19MeqkGb4SozRShTeqTgXoDRc";

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
    pub fn expire_todo(ctx: Context<ExpireTodo>, todo_id: u64) -> Result<()> {
    let todo = &mut ctx.accounts.todo_account;
    let current_time = Clock::get()?.unix_timestamp;

    require!(todo.deadline.is_some(), StakeDoError::NoDeadline);
    require!(current_time > todo.deadline.unwrap(), StakeDoError::DeadlineNotReached);
    require!(!todo.is_completed, StakeDoError::AlreadyCompleted);

    let total_lamports = **ctx.accounts.todo_account.to_account_info().lamports.borrow();
    let to_owner = total_lamports * 30 / 100;
    let to_user = total_lamports - to_owner;

    **ctx.accounts.todo_account.to_account_info().lamports.borrow_mut() -= total_lamports;
    **ctx.accounts.owner.to_account_info().lamports.borrow_mut() += to_owner;
    **ctx.accounts.user.to_account_info().lamports.borrow_mut() += to_user;

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

#[derive(Accounts)]
#[instruction(todo_id: u64)]
pub struct ExpireTodo<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: This is safe because we are only transferring lamports to it
    #[account(mut, address = Pubkey::from_str(APP_OWNER).unwrap())]
    pub owner: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"todo", user.key().as_ref(), &todo_id.to_le_bytes()],
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
    #[msg("Deadline not yet reached.")]
    DeadlineNotReached,
    #[msg("No deadline set.")]
    NoDeadline,
}


