// src/starter.tsx
import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

const app = new Hono()

const Layout: FC = (props) => {
    return (
        <html>
            <head>
                <title>htmx sample</title>
                <script src="https://unpkg.com/htmx.org@2"></script>
            </head>
            <body>{props.children}</body>
        </html>
    )
}

const Top: FC<{ messages: string[] }> = (props: {
    messages: string[]
}) => {
    return (
        <Layout>
            {
                props.messages.map((message) => {
                    return <p>{message}</p>
                })
            }
            <button hx-get="/hello" hx-target="#result">
                読み込み
            </button>
            <div id="result">ここに結果が表示されます</div>
        </Layout>
    )
}
app.get('/', (c) => {
    const messages = ['Hello htmx!']
    return c.render(
        <Top messages={messages} />
    )
})
app.get('/hello', (c) => {
    return c.render(
        <p>こんにちは! <code><b>/hello</b></code></p>
    )
})

export default app
