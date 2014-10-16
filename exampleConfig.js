{
  /*
   * Port to listen on
   */
  "port": 3000,

  "tables": {

    "default": {
      "title": "Platform Deployment Status",
      "groups": [
        {
          "param": "target",
          "display": "Target"
        },
        {
          "param": "project",
          "display": "Project"
        },
        {
          "param": ["branch", "user", "timestamp"],
          "display": "Current Deployment"
        }
      ]

    }

  }

}