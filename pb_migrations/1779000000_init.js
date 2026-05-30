/// <reference path="../pb_data/types.d.ts" />

// Initial schema for Score Pocket.
//
// No-auth app: all collection API rules are public ("" = open to anyone).
// Anyone who can reach this Pocketbase instance can read and write these
// collections. Acceptable for local/personal use; revisit before exposing
// the instance publicly.
migrate(
  (app) => {
    const players = new Collection({
      type: 'base',
      name: 'players',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          max: 100,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_players_name` ON `players` (`name`)'],
    })
    app.save(players)

    const sessions = new Collection({
      type: 'base',
      name: 'sessions',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: false, max: 100 },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['active', 'finished'],
        },
        {
          name: 'players',
          type: 'relation',
          required: true,
          collectionId: players.id,
          minSelect: 1,
          maxSelect: 999,
          cascadeDelete: false,
        },
        {
          name: 'winners',
          type: 'relation',
          required: false,
          collectionId: players.id,
          maxSelect: 999,
          cascadeDelete: false,
        },
        { name: 'scores', type: 'json', required: false, maxSize: 2000000 },
        { name: 'incrementStep', type: 'number', required: false },
        { name: 'defaultScore', type: 'number', required: false },
        { name: 'finishedAt', type: 'date', required: false },
      ],
    })
    app.save(sessions)
  },
  (app) => {
    const sessions = app.findCollectionByNameOrId('sessions')
    if (sessions) app.delete(sessions)

    const players = app.findCollectionByNameOrId('players')
    if (players) app.delete(players)
  }
)
