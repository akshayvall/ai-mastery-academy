/* Volatile model facts used across curriculum modules. Verify against official
   provider documentation before changing the date or values. */
const MODEL_LANDSCAPE = Object.freeze({
    verified: '2026-07',
    verifiedDate: '2026-07-26',
    sources: Object.freeze({
        openai: Object.freeze({
            verifiedDate: '2026-07-26',
            models: 'https://developers.openai.com/api/docs/models',
            release: 'https://openai.com/index/gpt-5-6/'
        }),
        anthropic: Object.freeze({
            verifiedDate: '2026-07-26',
            models: 'https://platform.claude.com/docs/en/about-claude/models/overview',
            pricing: 'https://platform.claude.com/docs/en/about-claude/pricing'
        }),
        google: Object.freeze({
            verifiedDate: '2026-07-26',
            models: 'https://ai.google.dev/gemini-api/docs/models',
            sdkMigration: 'https://ai.google.dev/gemini-api/docs/migrate'
        })
    }),
    openai: Object.freeze({
        frontier: 'GPT-5.6 Sol',
        frontierId: 'gpt-5.6-sol',
        balanced: 'GPT-5.6 Terra',
        balancedId: 'gpt-5.6-terra',
        small: 'GPT-5.6 Luna',
        smallId: 'gpt-5.6-luna',
        context: '1.05M',
        contextTokens: 1050000,
        frontierPrice: Object.freeze({ input: '$5', output: '$30' }),
        balancedPrice: Object.freeze({ input: '$2.50', output: '$15' }),
        smallPrice: Object.freeze({ input: '$1', output: '$6' })
    }),
    anthropic: Object.freeze({
        frontier: 'Claude Fable 5',
        frontierId: 'claude-fable-5',
        reasoning: 'Claude Opus 5',
        reasoningId: 'claude-opus-5',
        balanced: 'Claude Sonnet 5',
        balancedId: 'claude-sonnet-5',
        small: 'Claude Haiku 4.5',
        smallId: 'claude-haiku-4-5-20251001',
        context: '1M',
        contextTokens: 1000000,
        smallContext: '200K',
        smallContextTokens: 200000,
        frontierPrice: Object.freeze({ input: '$10', output: '$50' }),
        reasoningPrice: Object.freeze({ input: '$5', output: '$25' }),
        balancedPrice: Object.freeze({ input: '$2', output: '$10' }),
        balancedIntroThrough: '2026-08-31',
        balancedStandardPrice: Object.freeze({ input: '$3', output: '$15' }),
        smallPrice: Object.freeze({ input: '$1', output: '$5' })
    }),
    google: Object.freeze({
        stable: 'Gemini 3.6 Flash',
        stableId: 'gemini-3.6-flash',
        frontier: 'Gemini 3.1 Pro Preview',
        frontierId: 'gemini-3.1-pro-preview',
        frontierStatus: 'Preview',
        small: 'Gemini 3.5 Flash',
        smallId: 'gemini-3.5-flash',
        context: '1,048,576',
        contextTokens: 1048576,
        supported25: 'Gemini 2.5 remains supported'
    })
});