use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod mening_deregim {
    use super::*;

    // Пользователь сохраняет хеш своих данных
    pub fn store_data(
        ctx: Context<StoreData>,
        data_hash: String,
        price_lamports: u64,
        category: String,
    ) -> Result<()> {
        let record = &mut ctx.accounts.data_record;
        record.owner = ctx.accounts.user.key();
        record.data_hash = data_hash;
        record.price_lamports = price_lamports;
        record.category = category;
        record.is_available = true;
        record.created_at = Clock::get()?.unix_timestamp;
        record.total_earned = 0;

        emit!(DataStored {
            owner: record.owner,
            category: record.category.clone(),
            price: record.price_lamports,
        });

        Ok(())
    }

    // AI инициирует покупку данных — автоматически платит пользователю
    pub fn purchase_data(
        ctx: Context<PurchaseData>,
        ai_reasoning: String,
        ai_confidence: u8,
    ) -> Result<()> {
        let record = &mut ctx.accounts.data_record;

        require!(record.is_available, ErrorCode::DataNotAvailable);
        require!(
            ctx.accounts.buyer.lamports() >= record.price_lamports,
            ErrorCode::InsufficientFunds
        );

        // Переводим деньги от компании пользователю автоматически
        let price = record.price_lamports;
        **ctx.accounts.buyer.try_borrow_mut_lamports()? -= price;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += price;

        record.total_earned += price;

        // Записываем решение AI on-chain навсегда
        emit!(DataPurchased {
            owner: record.owner,
            buyer: ctx.accounts.buyer.key(),
            price_lamports: price,
            ai_reasoning,
            ai_confidence,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Пользователь отзывает данные
    pub fn revoke_data(ctx: Context<RevokeData>) -> Result<()> {
        let record = &mut ctx.accounts.data_record;
        require!(
            record.owner == ctx.accounts.user.key(),
            ErrorCode::Unauthorized
        );
        record.is_available = false;
        Ok(())
    }
}

// Структура записи данных
#[account]
pub struct DataRecord {
    pub owner: Pubkey,
    pub data_hash: String,
    pub price_lamports: u64,
    pub category: String,
    pub is_available: bool,
    pub created_at: i64,
    pub total_earned: u64,
}

// Контексты
#[derive(Accounts)]
pub struct StoreData<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 64 + 8 + 32 + 1 + 8 + 8
    )]
    pub data_record: Account<'info, DataRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseData<'info> {
    #[account(mut)]
    pub data_record: Account<'info, DataRecord>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut, address = data_record.owner)]
    pub owner: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeData<'info> {
    #[account(mut)]
    pub data_record: Account<'info, DataRecord>,
    pub user: Signer<'info>,
}

// События (логируются on-chain навсегда)
#[event]
pub struct DataStored {
    pub owner: Pubkey,
    pub category: String,
    pub price: u64,
}

#[event]
pub struct DataPurchased {
    pub owner: Pubkey,
    pub buyer: Pubkey,
    pub price_lamports: u64,
    pub ai_reasoning: String,
    pub ai_confidence: u8,
    pub timestamp: i64,
}

// Ошибки
#[error_code]
pub enum ErrorCode {
    #[msg("Data is not available")]
    DataNotAvailable,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized")]
    Unauthorized,
}
