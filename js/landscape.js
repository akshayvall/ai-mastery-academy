/* Volatile model facts used across curriculum modules. Verify against official
   provider documentation before changing the date or values. */
const MODEL_LANDSCAPE = Object.freeze({
    verified: '2026-11',
    verifiedDate: '2026-11-11',
    verificationStatus: 'source-reviewed',
    verificationNote: 'Catalogue names, lifecycle notices, and listed USD API token rates were source-reviewed. Catalogue choices are distinct from supported older lab pins; provider labs have not been executed. GPT-5.6 Sol rates are promotional through November 30, 2026, with a higher long-context tier. Haiku 5.5 base rates apply up to 100K input tokens; above that, input/output are $0.50/$2.50 per MTok. Check tiers, cache/tool charges, platform access, and account terms before use.',
    reviewOwner: 'Akshay',
    nextReviewDate: '2026-11-17',
    sources: Object.freeze({
        openai: Object.freeze({
            verifiedDate: '2026-11-11',
            models: 'https://developers.openai.com/api/docs/models',
            release: 'https://developers.openai.com/api/docs/models/gpt-5.6-sol',
            lifecycle: 'https://developers.openai.com/api/docs/deprecations'
        }),
        anthropic: Object.freeze({
            verifiedDate: '2026-11-11',
            models: 'https://platform.claude.com/docs/en/about-claude/models/overview',
            pricing: 'https://platform.claude.com/docs/en/about-claude/pricing',
            lifecycle: 'https://platform.claude.com/docs/en/about-claude/model-deprecations'
        }),
        google: Object.freeze({
            verifiedDate: '2026-11-11',
            models: 'https://ai.google.dev/gemini-api/docs/models',
            sdkMigration: 'https://ai.google.dev/gemini-api/docs/migrate',
            lifecycle: 'https://ai.google.dev/gemini-api/docs/deprecations'
        })
    }),
    openai: Object.freeze({
        frontier: 'GPT-6 Astra',
        frontierId: 'gpt-6-astra',
        supported: 'GPT-5.6 Sol',
        supportedId: 'gpt-5.6-sol',
        balanced: 'GPT-6.1 Sol',
        balancedId: 'gpt-6.1-sol',
        small: 'GPT-6 Luna',
        smallId: 'gpt-6-luna',
        context: '1.05M',
        contextTokens: 1050000,
        frontierPrice: Object.freeze({ input: '$10', output: '$50' }),
        supportedPrice: Object.freeze({ input: '$4', output: '$20' }),
        balancedPrice: Object.freeze({ input: '$2', output: '$10' }),
        smallPrice: Object.freeze({ input: '$0.10', output: '$0.50' })
    }),
    anthropic: Object.freeze({
        frontier: 'Claude Fable 5.2',
        frontierId: 'claude-fable-5-2',
        reasoning: 'Claude Opus 5.5',
        reasoningId: 'claude-opus-5-5',
        balanced: 'Claude Sonnet 5.5',
        balancedId: 'claude-sonnet-5-5',
        small: 'Claude Haiku 5.5',
        smallId: 'claude-haiku-5-5',
        context: '1M',
        contextTokens: 1000000,
        smallContext: '1M',
        smallContextTokens: 1000000,
        frontierPrice: Object.freeze({ input: '$8', output: '$40' }),
        reasoningPrice: Object.freeze({ input: '$4', output: '$20' }),
        balancedPrice: Object.freeze({ input: '$2', output: '$10' }),
        balancedPriceStatus: 'Standard Sonnet 5.5 pricing. Older Sonnet 5 lab pins remain active at $2/$10 per MTok after their planned September increase was cancelled; neither pin is provider-tested here.',
        balancedStandardPrice: Object.freeze({ input: '$2', output: '$10' }),
        smallPrice: Object.freeze({ input: '$0.10', output: '$0.50' })
    }),
    google: Object.freeze({
        stable: 'Gemini 3.8 Flash',
        stableId: 'gemini-3.8-flash',
        supported: 'Gemini 3.6 Flash',
        supportedId: 'gemini-3.6-flash',
        frontier: 'Gemini 4 Carbon',
        frontierId: 'gemini-4-carbon',
        frontierStatus: 'Current catalogue; verify account availability',
        small: 'Gemini 3.5 Flash-Lite',
        smallId: 'gemini-3.5-flash-lite',
        context: '1,048,576',
        contextTokens: 1048576,
        supported25: 'Gemini 2.5 Pro and Flash are deprecated and limited to existing API users, not selectable in AI Studio. On December 1, 2026, Pro requests reroute to 3.8 Flash and Flash requests to 3.5 Flash-Lite, with replacement-model billing and API differences. 2.5 Flash-Lite is not deprecated but is also access-limited.'
    })
});