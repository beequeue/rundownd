{
  /*
   * Port to listen on
   * default: 3000
   */
  "port": 3000,

  /*
   * Defines the mechanism by which data is persisted
   */
  "storage": {

    /*
     * Indicates the module to use.  Will be used to look for a module
     * in ./lib/storage/<type>.js
     */
    "type": "flatfile",

    /*
     * Options that are passed directly to the above module's init function
     */
    "options": {
      "directory": "./data"
    }

  },

  /*
   * Data sets are the buckets into which events are put
   */
  "datasets": {

    /*
     * The property name is the identifier for the dataset.  If you are
     * sending data to more than one dataset, you can specify which one using
     * the special "rd-dataset" param.
     */
    "default": {

      /*
       * This array defines the valid paramaters for this dataset.  Any
       * paramters not in this list will be silently ignored.
       */
      "params": ["target", "project", "branch", "user", "timestamp"],

      /*
       * This array defines the compound key used to group events by for
       * purposes of knowing how many events to keep historically.
       */
      "groupBy": ["target", "project"],

      /*
       * Number of events per groupBy to keep.
       */
      "keepCount": 3,

      /*
       * Method by which data is flushed to persistence
       */
      "flushMethod": "immediate",

      /*
       * The views array allows you to define how the data will be displayed.
       */
      "views": [
        {
          /*
           * A title for the view.
           */
          "title": "Platform Deployment Status",

          /*
           * The groups array lets us define how the data is grouped, from
           * broadest to narrowest.  You can visualise this as columns of a
           * table with large rows spans getting smaller as you go across.
           *
           * In the example below, we're asking for a view which puts Target as
           * the first column, breaks that down by project in the second, then
           * gives us a concatenation of branch, user and timestamp under the
           * heading "Current Deployment" in the third column.  In this example
           * there will be no extra row span in the second column - we're just
           * using it for layout purposes.
           */
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
              "param": "branch",
              "display": "Branch"
            },
            {
              "param": "user",
              "display": "User"
            },
            {
              "param": "timestamp",
              "display": "When"
            }
          ]
        }
      ]

    }

  }

}
