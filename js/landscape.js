/* Volatile model facts used across curriculum modules. Verify against official
   provider documentation before changing the date or values. */
const MODEL_LANDSCAPE = Object.freeze({
    verified: '2026-07',
    openai: Object.freeze({
        frontier: 'GPT-5.6 Sol',
        balanced: 'GPT-5.6 Terra',
        small: 'GPT-5.6 Luna',
        smallId: 'gpt-5.6-luna',
        frontierPrice: Object.freeze({ input: '$5', output: '$30' }),
        balancedPrice: Object.freeze({ input: '$2.50', output: '$15' }),
        smallPrice: Object.freeze({ input: '$1', output: '$6' })
    }),
    anthropic: Object.freeze({
        frontier: 'Claude Fable 5',
        reasoning: 'Claude Opus 4.8',
        balanced: 'Claude Sonnet 5',
        small: 'Claude Haiku 4.5',
        context: '1M',
        frontierPrice: Object.freeze({ input: '$10', output: '$50' }),
        reasoningPrice: Object.freeze({ input: '$5', output: '$25' }),
        balancedPrice: Object.freeze({ input: '$3', output: '$15' }),
        smallPrice: Object.freeze({ input: '$1', output: '$5' })
    }),
    google: Object.freeze({
        frontier: 'Gemini 3.5 Pro',
        small: 'Gemini 3.5 Flash',
        context: '2M'
    })
});