module.exports = function(robot) {

  robot.respond('last commits', function (msg) {
    commits = robot.brain.commits;
    msg.send('test');
    msg.send(JSON.stringify(commits[0]));

  });

  robot.router.post('/bitbucket/push', function(req, res) {
      var data = {commits:[]};
      if (req.body.payload) {
        data = JSON.parse(req.body.payload);
      }
      robot.brain.commits = robot.brain.commits || [];



      var attachments = []

      if (data.commits) { for (j = 0, len = data.commits.length; j < len; j++) {

        var commit = data.commits[j];
        commit.repository = data.repository;
        robot.brain.commits.unshift(commit);

        var pretext = ''
        if (j === 0) {
          pretext = "New commits to " + data.repository.name
        }

        attachments.push({
            // see https://api.slack.com/docs/attachments
          pretext: pretext,
          color: "#439FE0",
          title: commit.node.substr(4) + '... ' + commit.message.split("\n")[0],
          title_link: 'https://bitbucket.org' + data.repository.absolute_url + 'commits/' + commit.raw_node,
          fallback: commit.message.split("\n")[0],
          fields: [,
            {
              "title": "Commiter",
              "value": commit.author,
              "short": true
            },
            {
              "title": "Branch",
              "value": commit.branch,
              "short": true
            }
          ]
        });

      }}

      robot.emit('slack.attachment', {
          content: {
              attachments: attachments
          },
          channel: "#deployment"
      });


      res.send('OK');

  });
}
