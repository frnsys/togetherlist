import _ from 'underscore';
import util from './Util';

const render = {
  result: function(data) {
    return `
      <li class="result">
          <div class="result-preview">
            <h2><span>${util.truncate(data.name, 30)}</span></h2>
            <p class="result-description">${util.truncate(data.description, 132)}</p>
          </div>
          <div class="result-info">
              <h3><a href="${data.website ? data.website : '#'}" target="_blank">${data.name}</a> welcomes ${util.joinAnd(_.map(data.services, s => `<span class="result-service">${s.toLowerCase().replace('esl', 'ESL')}</span>`))}${data.additionalServices.length > 0 ? ' help' : ''}.</h3>
              <div class="result-meta">
                <div class="result-meta-info">
                  ${data.state ? `<h5><span class="result-meta-lead">Based in </span><span class="result-state" data-state="${data.state}">${data.state}</span></h5>` : ''}
                  <h5>${data.categories.join(', ')}</h5>
                </div>
                <div class="result-meta-share">
                  ${data.number ? `<a href="tel:${data.number}"><i class="fa fa-phone"></i></a>` : ''}
                  <i class="fa fa-share-alt action-share" data-id="${data.id}"></i>
                </div>
              </div>
              <div class="result-actions">
                ${data.donatelink ? `<a target="_blank" href="${data.donatelink}">Donate</a>` : ''}
                ${data.volunteerlink ? `<a target="_blank" href="${data.volunteerlink}">Volunteer</a>` : ''}
              </div>
          </div>
          <div class="result-sharing"></div>
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
  },

  sharing: function(org) {
    var twitter = `https://twitter.com/intent/tweet?text=${encodeURI('Support: ')}&url=${encodeURI(org.website)}&via=thetogetherlist`,
        facebook = `https://www.facebook.com/sharer.php?u=${encodeURI(org.website)}`,
        tumblr = `http://tumblr.com/widgets/share/tool?title=${encodeURI(org.name)}&canonicalUrl=${encodeURI(org.website)}&caption=${encodeURI(org.description)}`,
        email = `mailto:?&subject=Check out ${org.name}&body=${encodeURI([org.website, org.description].join('\n\n'))}`;
    return `
      <li><a href="${twitter}" title="Share via Twitter" target="_blank"><i class="fa fa-twitter"></i></a></li>
      <li><a href="${facebook}" title="Share via Facebook" target="_blank"><i class="fa fa-facebook"></i></a></li>
      <li><a href="${tumblr} title="Share via Tumblr" target="_blank"><i class="fa fa-tumblr"></i></a></li>
      <li><a href="${email}" title="Share via Email" target="_blank"><i class="fa fa-envelope"></i></a></li>
    `;
  }
};

export default render;
