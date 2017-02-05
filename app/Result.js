import _ from 'underscore';
import React, {Component} from 'react';
import util from './Util';

function sharing(org) {
  var twitter = `https://twitter.com/intent/tweet?text=${encodeURI('Support: ')}&url=${encodeURI(org.website)}&via=thetogetherlist`,
      facebook = `https://www.facebook.com/sharer.php?u=${encodeURI(org.website)}`,
      tumblr = `http://tumblr.com/widgets/share/tool?title=${encodeURI(org.name)}&canonicalUrl=${encodeURI(org.website)}&caption=${encodeURI(org.description)}`,
      email = `mailto:?&subject=Check out ${org.name}&body=${encodeURI([org.website, org.description].join('\n\n'))}`;
  return <ul>
    <li><a href={twitter} title="Share via Twitter" target="_blank"><i className="fa fa-twitter"></i></a></li>
    <li><a href={facebook} title="Share via Facebook" target="_blank"><i className="fa fa-facebook"></i></a></li>
    <li><a href={tumblr} title="Share via Tumblr" target="_blank"><i className="fa fa-tumblr"></i></a></li>
    <li><a href={email} title="Share via Email" target="_blank"><i className="fa fa-envelope"></i></a></li>
  </ul>;
}

function rating(rating) {
  var els = [],
      r = rating;
  if (rating < 0) {
    return 'N/A';
  } else {
    _.each(_.range(Math.floor(rating)), () => {
      els.push('<i class="fa fa-star"></i>');
      r--;
    });
    if (r > 0) {
      els.push('<i class="fa fa-star-half-o"></i>');
    }
    _.each(_.range(5 - Math.ceil(rating)), () => {
      els.push('<i class="fa fa-star-o"></i>');
    });
    return els.join('');
  }
}

class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSharing: false
    };
  }

  render() {
    var needs = util.joinAnd(this.props.services.map((s, i) => <span key={i} className="result-service">{s.toLowerCase().replace('esl', 'ESL')}</span>));
    return <li className="result" onMouseLeave={() => this.setState({showSharing: false})}>
        <div className="result-preview">
          <h2><span>{util.truncate(this.props.name, 30)}</span></h2>
          <p className="result-description">{util.truncate(this.props.description, 132)}</p>
        </div>
        <div className="result-info">
          <h3><a href={this.props.website ? this.props.website : '#'} target="_blank">{this.props.name}</a> welcomes {needs}{this.props.additionalServices.length > 0 ? ' help' : ''}.</h3>
            <div className="result-meta">
              <div className="result-meta-share">
                {this.props.number ? <a href={`tel:${this.props.number}`}><i className="fa fa-phone"></i></a> : ''}
                <i className="fa fa-share-alt action-share" data-id="{this.props.id}" onClick={() => this.setState({showSharing:true})}></i>
                {this.props.deductible ? <i className="result-meta-icon" title="Tax Deductible">$</i> : ''}
                {this.props.accredited ? <i className="result-meta-icon" title="Accredited">AB</i> : ''}
                {this.props.rating >= 0 ? <i className="result-meta-icon" title="Charity Navigator Rating">{this.props.rating}<i className="fa fa-star"></i></i> : ''}
              </div>
              <div className="result-meta-info">
                {this.props.state ? <h5><span className="result-meta-lead">Based in </span><span className="result-state" data-state={this.props.state}>{this.props.state}</span></h5> : ''}
                <h5><span className="result-meta-lead">Filters </span>{this.props.categories.join(', ')}</h5>
              </div>
            </div>
            <div className="result-actions">
              {this.props.donatelink ? <a target="_blank" href={this.props.donatelink}>Donate</a> : ''}
              {this.props.volunteerlink ? <a target="_blank" href={this.props.volunteerlink}>Volunteer</a> : ''}
            </div>
        </div>
        <div className="result-sharing" style={{display: this.state.showSharing ? 'block': 'none'}}>
          {sharing(this.props)}
        </div>
    </li>;
  }
};

export default Result;
