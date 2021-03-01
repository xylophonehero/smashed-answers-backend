const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
const { nanoid } = require('nanoid')

module.exports = {
  async create(ctx)
  {
    let entity
    if (ctx.is('multipart'))
    {
      const { data, files } = parseMultipartData(ctx)


      if (!data || !data.textClue || !data.answer) ctx.throw(400, "Please write a text clue/answer")

      if (!files || !files.pictureClue)
      {
        ctx.throw(400, "Please provide an image")
      }

      const { user } = ctx.state

      const uid = nanoid()

      entity = await strapi.services.question.create({ ...data, ...{ author: user }, ...{ uid } }, { files })
    } else
    {
      ctx.throw(400, "Please use multipart/form-data")
    }

    return sanitizeEntity(entity, { model: strapi.models.question })
  },

  async findUser(ctx)
  {
    const { user } = ctx.state
    let entities

    if (ctx.query._q)
    {
      entities = await strapi.services.question.search({ ...ctx.query, author: user.id });
    } else
    {
      entities = await strapi.services.question.find({ ...ctx.query, author: user.id });
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.question }));
  },
  async userCount(ctx)
  {
    const { user } = ctx.state


    if (ctx.query._q)
    {
      return strapi.services.question.countsSearch({ ...ctx.query, author: user.id });
    }
    return strapi.services.question.count({ ...ctx.query, author: user.id });


  },

  async delete(ctx)
  {
    const { id } = ctx.params;

    const entity = await strapi.services.restaurant.delete({ id });

    if (entity)
    {
      strapi.plugins.upload.services.upload.remove(entity.pictureClue)
    }
    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },

  async updateAnswered(ctx)
  {
    const { user } = ctx.state
    const { id } = ctx.params


    if (ctx.is('multipart'))
    {
      ctx.throw(400, "Please use JSON")
    }

    const question = await strapi.services.question.findOne({ id })

    if (!question)
    {
      ctx.throw(400, "Question not found")
    }

    const entity = await strapi.services.question.update({ id }, {
      usersAnswered: [...question.usersAnswered, user]
    })

    return sanitizeEntity(entity, { model: strapi.models.question })


  },

  async findUnanswered(ctx)
  {
    const { user } = ctx.state

    const [orderBy, direction] = ctx.query._sort.split(':')

    console.log(orderBy)
    if (!user)
    {
      ctx.throw(400, "Log in to find unanswered questions")
    }

    const knex = strapi.connections.default
    const results = await knex('questions')
      .whereNotExists(function ()
      {
        this.select('*').from('question-sessions').whereRaw('question = questions.id').andWhere('user', user.id)
      })
      .limit(parseInt(ctx.query._limit))
      .orderBy(orderBy, direction)
      .select('id')

    console.log(results)

    let entities = []

    for (const result of results)
    {
      let entity = await strapi.services.question.findOne({ id: result.id })
      entities.push(entity)
    }
    // console.log(entities)

    // const entities = await results.reduce(async (acc, curr) =>
    // {
    //   let entity = await strapi.services.question.findOne({ id: curr.id })
    //   acc.push(entity)
    // }, [])
    // console.log(entities)

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.question }))

    // let entities;
    // if (ctx.query._q)
    // {
    //   entities = await strapi.services.question.search({ ...ctx.query, });
    //   // console.log(entities)
    // } else
    // {
    //   entities = await strapi.services.question.find({ ...ctx.query, question_sessions_ncontains: 14 });
    //   // console.log(entities)
    // }
    // console.log(entities)
    // return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.question }));
  }
};
