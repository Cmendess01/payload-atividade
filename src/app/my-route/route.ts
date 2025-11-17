import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async (request: Request) => {
  try {
    await getPayload({
      config: configPromise,
    })
  } catch (err) {
    // Log the payload init error but continue to return a valid response.
    // eslint-disable-next-line no-console
    console.error('Payload init error in /my-route:', err)
  }

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
