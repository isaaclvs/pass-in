import fastify from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const app = fastify()

const prisma = new PrismaClient({
  log: ['query'],
})


// Métodos/verbos (Methods/verbs): get, post, put, delete, patch, head, options...
// Corpo da requisição (Body request)
// Parâmetros de busca (search params / query params) 'http://localhost:3333/users?name=Isaac'
// Parâmetros de rota (route params) -> identificação de recursos 'DELETE http://localhost:3333/user/5'
// Cabeçalhos (headers) -> Contexto

// JSON - JavaScript Object Notation  ->  Serve para a comunicação entre front-end e back-end


// Método/verbo "Post" para criar algo:
app.post('/events', async (request, reply) => {
// Criando o objeto de exemplo para o ZOD verificar se o body do usuário segue os requisitos:
  const createEventSchema = z.object({
    title: z.string().min(4),
    details: z.string().nullable(),
    maximumAttendees: z.number().int().positive().nullable(),
  })

// Criando uma variável que irá validar o body request de acordo com o exemplo criado:
  const data = createEventSchema.parse(request.body)

// Utilizando o prisma para criar o evento no banco de dados com os dados da variável -data-:
  const event = await prisma.event.create({
    data: {
      title: data.title,
      details: data.details,
      maximumAttendees: data.maximumAttendees,
      slug: new Date().toISOString(),  // gambiarra para passar direto
    },
  })

  return reply.status(201).send({ eventId: event.id })
})

app.listen({ port: 3333}).then(() => {
  console.log('HTTP server running')
  })
