import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { generateSlug } from "../utils/generate-slug";
import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify";

export async function createEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/events', {
      schema: {
        body: z.object({
          title: z.string().min(4),
          details: z.string().nullable(),
          maximumAttendees: z.number().int().positive().nullable(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          })
        },
      },
    }, async (request, reply) => {

    // Criando uma variável que irá validar o body request de acordo com o exemplo criado:
      const {
        title,
        details,
        maximumAttendees,
      } = request.body

      const slug = generateSlug(title)

      // Verificando se o slug gerado já existe
      const eventWithSameSlug = await prisma.event.findUnique({
        where:{
          slug,
        }
      })

      // Caso o slug já exista, enviar mensagem personalizada de erro
      if (eventWithSameSlug !== null) {
        throw new Error('Another event with same title already exists.')
      }

    // Utilizando o prisma para criar o evento no banco de dados com os dados da variável -data-:
      const event = await prisma.event.create({
        data: {
          title,
          details,
          maximumAttendees,
          slug,
        },
      })

      return reply.status(201).send({ eventId: event.id })
    })
}
