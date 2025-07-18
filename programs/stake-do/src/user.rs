use anchor_lang::prelude::*;
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

