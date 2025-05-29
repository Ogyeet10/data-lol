# data(lol)

data(lol) is a website built for an ECS class. It is a great looking React/Next.js implementation of data analysis code that was provided by my teacher.

>This project is licensed under the GPL-3.0 License.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Processing Model

All data processing for this application is performed locally within the user's browser. The app uses asynchronous operations to help with responsiveness, meaning the interface remains interactive even while data is processing in the background. No csv data is ever sent to a server for processing.

## Deploy on Vercel

Vercel is a cloud platform for static sites and Serverless Functions that enables developers to host web projects with ease. It's developed by the creators of Next.js and offers a seamless deployment experience for Next.js applications.



To deploy your Next.js app to Vercel:
1. Sign up or log in to [Vercel](https://vercel.com).
2. Connect your Git provider and import your project.
3. Configure project settings if needed (Vercel often auto-detects Next.js settings).
4. Click "Deploy".

For more detailed information, you can check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) or the [Vercel documentation](https://vercel.com/docs).

## License

This project is licensed under the GPL-3.0 License. See the `LICENSE` file for more details.
