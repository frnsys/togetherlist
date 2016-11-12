import _ from 'underscore';
import util from './Util';


const render = {
  result: function(data) {
    return `
      <li class="result">
          <div class="result-preview">
            <h2><span>${util.truncate(data.name, 30)}</span></h2>
            <p class="result-description">${util.truncate(data.description, 100)}</p>
          </div>
          <div class="result-info">
              <h3><a href="${data.website}">${data.name}</a> welcomes ${_.map(data.services, s => `<span class="result-service">${s.toLowerCase()}</span>`).join(', ')} help.</h3>
              <div class="result-meta">
                <div class="result-meta-info">
                  ${data.state ? `<h5><span class="result-meta-lead">Based in</span> ${data.state}</h5>` : ''}
                  <h5>${data.categories.join(', ')}</h5>
                </div>
                <div class="result-meta-share">
                  <i class="fa fa-phone"></i>
                  <i class="fa fa-share-alt"></i>
                </div>
              </div>
              <div class="result-actions">
                ${data.donatelink ? `<a href="${data.donatelink}">Donate</a>` : ''}
                ${data.volunteerlink ? `<a href="${data.volunteerlink}">Volunteer</a>` : ''}
              </div>
          </div>
      </li>`;
  },

  rating: function(rating) {
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
};

export default render;
