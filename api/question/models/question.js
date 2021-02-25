'use strict';
const c = 1.5
const d = 0.5
const e = 1.3
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    beforeUpdate: async (params, data) =>
    {
      if (typeof data.views !== 'undefined')
      {
        if (typeof data.correctGuesses !== 'undefined')
        {
          if (data.view === 0)
          {
            data.difficulty === 0
          } else
          {
            data.difficulty = data.correctGuesses / data.views
          }

          console.log("difficulty", data.difficulty)
        }

        if (typeof data.likes !== 'undefined' && typeof data.dislikes !== 'undefined')
        {
          data.score = data.views + c * data.likes - Math.pow(d * data.dislikes, e)
          console.log("score", data.score)
        }
      }
    }
  }
};
