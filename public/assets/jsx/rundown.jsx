
var RundownTable = React.createClass({
  getInitialState: function() {
    return {data: {}, view: {title: 'Loading...'}};
  },

  getDefaultProps: function() {
    return {
      dataset: 'default'
    };
  },

  // Get dataset config and current data
  componentDidMount: function() {
    $.ajax({
      url: "api/dataset/" + this.props.dataset,
      success: function(resp) {
        console.log('setting state');
        this.setState({
          data: resp.data,
          view: resp.config.views[0]
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div>
        <h1>{this.state.view.title}</h1>
        <table>
          <RundownTableHead view={this.state.view} />
          <RundownTableBody data={this.state.data} />
        </table>
      </div>
    );
  }
});

//--------------------------------------------------------------------------

var RundownTableHead = React.createClass({

  render: function() {
    console.log('rendering head');
    if (!this.props.view.groups) {
      return (<thead/>);
    }
    var thNodes = this.props.view.groups.map(function(group) {
      return (
        <th key={group.param}>{group.display}</th>
      );
    });
    return (
      <thead>
        <tr>
          {thNodes}
        </tr>
      </thead>
    );
  }
});

//--------------------------------------------------------------------------

var RundownTableBody = React.createClass({
  render: function() {
    return (
      <tbody>
        <tr><td>Body</td></tr>
      </tbody>
    );
  }
});

//--------------------------------------------------------------------------

var RundownTableRow = React.createClass({
  render: function() {
    return (
      <tbody>
        <tr><td>Body</td></tr>
      </tbody>
    );
  }
});


//--------------------------------------------------------------------------

React.render(
  <RundownTable socket={io()} />,
  document.getElementById('rundown-container')
);