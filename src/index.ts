import { Hono } from 'hono'
import { cors } from 'hono/cors'
import sgMail from "@sendgrid/mail";

const app = new Hono<{
  Bindings: {
    RECIPIENT_ADDRESS: string,
    SENDER_ADDRESS: string,
    SEND_GRID_API_KEY: string,
    ALLOWED_ORIGINS: string
  }
}>()

// app.use('*', (c, next) => {
//   const origins = c.env.ALLOWED_ORIGINS == '*' ? '*' : c.env.ALLOWED_ORIGINS.split(',');
//   const corsMiddleware = cors();
//   return corsMiddleware(c, next);
// });

app.use('*', cors());

app.get('/', (c) => {
  return c.text('Hello!')
});

app.post("/", async (c) => {
  sgMail.setApiKey(c.env.SEND_GRID_API_KEY);
  const text = await c.req.text();
  const body = JSON.parse(text);
  if (!body['body']) {
    c.status(400)
    return c.json({
      "status": "error",
      "message": "Missing subject or body"
    })
  }

  const msg = {
    to: c.env.RECIPIENT_ADDRESS,
    from: c.env.SENDER_ADDRESS,
    subject: "Contact from Portfolio",
    text: `Hi I am ${body['body'].name}.
          My email is ${body['body'].email}.
          ${body['body'].message}`
  }

  try {
    await sgMail.send(msg);
    c.status(200);
    return c.json({ message: "Successfully sent mail." });
  } catch (error) {
    console.log(error);
    c.status(500);
    return c.json({ message: "Faild to send mail." });
  }

});

export default app
