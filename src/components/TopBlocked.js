/* Pi-hole: A black hole for Internet advertisements
*  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
*  Network-wide ad blocking via your own hardware.
*
*  Web Interface
*  Top Blocked component
*
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license. */

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { api, ignoreCancel, makeCancelable } from '../utils';

class TopBlocked extends Component {
  state = {
    loading: true,
    total_blocked: 0,
    top_blocked: []
  };

  constructor(props) {
    super(props);
    this.updateChart = this.updateChart.bind(this);
  }

  updateChart() {
    this.updateHandler = makeCancelable(
      api.getTopBlocked(),
      { repeat: this.updateChart, interval: 10 * 60 * 1000 }
    );
    this.updateHandler.promise.then(res => {
      this.setState({
        loading: false,
        total_blocked: res.blocked_queries,
        top_blocked: res.top_blocked
      });
    }).catch(ignoreCancel);
  }

  generateTable = t => {
    if(this.state.top_blocked.length === 0) {
      return t("No Domains Found");
    }

    return (
      <table className="table table-bordered">
        <tbody>
        <tr>
          <th>{t("Domain")}</th>
          <th>{t("Hits")}</th>
          <th>{t("Frequency")}</th>
        </tr>
        {this.generateRows(t)}
        </tbody>
      </table>
    );
  };

  generateRows = t => {
    return this.state.top_blocked.map(item => {
      const percentage = item.count / this.state.total_blocked * 100;
      return (
        <tr key={item.domain}>
          <td>
            {item.domain}
          </td>
          <td>
            {item.count.toLocaleString()}
          </td>
          <td style={{"verticalAlign": "middle"}}>
            <div className="progress"
                 title={
                   t("{{percent}}% of {{total}}", {
                     percent: percentage.toFixed(1),
                     total: this.state.total_blocked.toLocaleString()
                   })
                 }>
              <div className="progress-bar bg-warning" style={{width: percentage + "%"}}/>
            </div>
          </td>
        </tr>
      );
    });
  };

  componentDidMount() {
    this.updateChart();
  }

  componentWillUnmount() {
    this.updateHandler.cancel();
  }

  render() {
    const { t } = this.props;

    return (
      <div className="card">
        <div className="card-header">
          {t("Top Blocked Domains")}
        </div>
        <div className="card-body">
          <div style={{overflowX: "auto"}}>
            {this.generateTable(t)}
          </div>
        </div>
        {
          this.state.loading
            ?
            <div className="card-img-overlay" style={{background: "rgba(255,255,255,0.7)"}}>
              <i className="fa fa-refresh fa-spin" style={{position: "absolute", top: "50%", left: "50%", fontSize: "30px"}}/>
            </div>
            :
            null
        }
      </div>
    );
  }
}

export default translate(["common", "dashboard"])(TopBlocked);
