import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

const app = new Hono()

const Layout: FC = (props) => {
    return (
        <html>
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
        })}
        </Layout>
    )
}
app.get('/', (c) => {
    const messages = ['Hello Hono!']
    return c.render(
        <Top messages={messages} />
    )
})

export default app
