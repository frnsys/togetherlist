import _ from 'underscore';
import util from './Util';


const render = {
  result: function(data) {
    return `
      <li class="result">
          <h2>${util.truncate(data.name, 30)}</h2>
          <p class="result-description">${util.truncate(data.description, 100)}</p>
          <div class="result-info">
              <div class="result-actions">
                  ${data.donatelink ? `<a href="${data.donatelink}">Donate</a>` : ''}
                  ${data.donatelink && data.volunteerlink ? ' | ' : ''}
                  ${data.volunteerlink ? `<a href="${data.volunteerlink}">Volunteer</a>` : ''}
              </div>
              <div class="result-meta">
                  <h5>To <a href="${data.website}">${data.name}</a></h5>
                  ${data.state ? `<h5>Based in <a href="#">${data.state}</a></h5>` : ''}
              </div>
              <ul class="result-stats">
                  <li>
                      <h6>Charity Navigator Score</h6>
                      <div class="stars">
                        ${render.rating(data.rating)}
                      </div>
                  </li>
                  <li>
                      <h6>Tax Deductible</h6>
                      ${data.deductible ? `<i class="fa fa-check-circle"></i>` : `<i class="fa fa-times-circle"></i>`}
                  </li>
                  <li>
                      <h6>Accredited Business</h6>
                      ${data.accredited ? `<i class="fa fa-check-circle"></i>` : `<i class="fa fa-times-circle"></i>`}
                  </li>
              </ul>
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
