use anchor_lang::prelude::*;

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