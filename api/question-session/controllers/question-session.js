const { sanitizeEntity } = require('strapi-utils');

module.exports = {

  async create(ctx)
  {

    const { user } = ctx.state
    const { correct } = ctx.request.body
    const { questionId } = ctx.params

    const realQuestion = await strapi.services.question.findOne({ id: questionId })

    if (!realQuestion)
    {
      ctx.throw(400, "This question doesn't exist")
    }

    const foundQuestionSession = await strapi.services['question-session'].findOne({
      user: user.id,
      question: questionId
    })
    if (foundQuestionSession)
    {
      ctx.throw(400, "Question session already exists. Please use PUT")
    }

    if (ctx.is('multipart'))
    {
      ctx.throw(400, "Please use JSON request")
    }

    const entity = await strapi.services['question-session'].create({ correct, user: user.id, question: questionId });

    //update view of question
    const { views, correctGuesses } = realQuestion
    const updatedQuestion = await strapi.services.question.update({
      id: questionId,
    }, {
      views: views + 1,
      correctGuesses: correctGuesses + (correct ? 1 : 0)
    })

    return sanitizeEntity(entity, { model: strapi.models['question-session'] });
  },

  async update(ctx)
  {
    const { user } = ctx.state
    const { id } = ctx.params
    const { like } = ctx.request.body

    // const realQuestion = await strapi.services.question.findOne({ id: questionId })

    // if (!realQuestion)
    // {
    //   ctx.throw(400, "This question doesn't exist")
    // }

    if (ctx.is('multipart'))
    {
      ctx.throw(400, "Please use JSON request")
    }

    const foundQuestionSession = await strapi.services['question-session'].findOne({ id })


    if (!foundQuestionSession)
    {
      ctx.throw(400, "Question session not found. Please use POST")
    }

    if (foundQuestionSession.user.id !== user.id)
    {
      ctx.throw(400, "You don't belong this question-session")
    }

    //Calculate before updating
    const { like: prevLike } = foundQuestionSession
    if (prevLike === like)
    {
      ctx.throw(400, "Nothing to update")
    }

    const entity = await strapi.services['question-session'].update({ id }, { like })

    const realQuestion = foundQuestionSession.question

    //Update likes/dislikes
    const { likes, dislikes, views } = realQuestion

    const updatedQuestion = await strapi.services.question.update({
      id: realQuestion.id,
    }, {
      views: views,
      likes: likes + Math.max(like, 0) - Math.max(prevLike, 0),
      dislikes: dislikes - Math.min(like, 0) + Math.min(prevLike, 0)
    })


    return sanitizeEntity(entity, { model: strapi.models['question-session'] });
  },

  async delete(ctx)
  {
    const { user } = ctx.state
    const { questionId } = ctx.params

    const entity = await strapi.services['question-session'].delete({
      question: questionId,
      user: user.id
    })

    if (entity.length)
    {
      //Update likes/dislikes/views
      const { like, correct } = entity[0]
      const { views, likes, dislikes, correctGuesses } = entity[0].question

      const updatedQuestion = await strapi.services.question.update({
        id: questionId
      }, {
        views: views - 1,
        correctGuesses: correctGuesses - (correct ? 1 : 0),
        likes: likes - (like === 1 ? 1 : 0),
        dislikes: dislikes - (like === -1 ? 1 : 0)
      })

      return sanitizeEntity(entity[0], { model: strapi.models['question-session'] })
    }
  },

  async findOne(ctx)
  {
    const { user } = ctx.state
    const { questionId } = ctx.params;

    const entity = await strapi.services['question-session'].findOne({
      question: questionId,
      user: user.id
    })

    if (!entity)
      return []
    return sanitizeEntity(entity, { model: strapi.models['question-session'] });
  },

  async find(ctx)
  {
    const { user } = ctx.state
    const { question } = ctx.params;
    console.log(ctx.params)
    const entity = await strapi.services['question-session'].find({
      question,
      user: user.id
    })

    return sanitizeEntity(entity, { model: strapi.models['question-session'] });
  },
};
