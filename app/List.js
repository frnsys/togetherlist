import $ from 'jquery';
import _ from 'underscore';
import util from './Util';
import sheet from './Sheet';
import search from './Search';
import Result from './Result';
import Header from './Header';
import Footer from './Footer';
import React, {Component} from 'react';

const SPREADSHEET_ID = '1kq6z9cEeqqGL5R5mdclkj5HjD-w9dvL8xCYmhG1UziQ';
const NO_RESULTS_COPY = "Can't find the organization you're looking for? Help grow our Togetherlist database. Please submit using our <a href='https://docs.google.com/forms/d/e/1FAIpQLScS3scl2_LiNyDk0jf1CCPF9qsZlmrlvTWW_ckMlhGeEL0OXw/viewform?c=0&w=1'>Submissions Form</a>."

// http://stackoverflow.com/a/10997390/11236
function updateURLParameter(param, paramVal) {
  var newAdditionalURL = '';
  var tempArray = window.location.href.split('?');
  var baseURL = tempArray[0];
  var additionalURL = tempArray[1];
  var temp = '';
  if (additionalURL) {
    tempArray = additionalURL.split('&');
    for (var i=0; i<tempArray.length; i++){
      if(tempArray[i].split('=')[0] != param){
        newAdditionalURL += temp + tempArray[i];
        temp = '&';
      }
    }
  }
  var rows_txt = `${temp}${param}${paramVal ? `=${paramVal}` : ''}`;
  return `${baseURL}?${newAdditionalURL}${rows_txt}`;
}

function removeURLParameter(param, noVal) {
  //prefer to use l.search if you have a location/link object
  var url = window.location.href;
  var urlparts = url.split('?');
  if (urlparts.length>=2) {
    var param = encodeURIComponent(param);
    var prefix = noVal ? param : param + '=';
    var pars = urlparts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (var i = pars.length; i-- > 0;) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
    return url;
  } else {
    return url;
  }
}

function resetURL() {
  var url = window.location.href;
  var urlparts = url.split('?');
  window.history.replaceState('', '', urlparts[0]);
}

function getParameterByName(name) {
  var url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class List extends Component {
  componentWillMount() {
    this.setState({
      orgs: [],
      services: [],
      categories: [],
      subCategories: [],
      showFilters: false,
      showSearchResults: false,
      loading: true
    });
    this.resetFilters(true);
    this.loadOrgs();
    this.loadServices();
    this.loadCategories();
    this.loadSubCategories();
  }

  resetFilters(preset) {
    var filters;
    if (preset) {
      var flags = getParameterByName('flags'),
          services = getParameterByName('services'),
          categories = getParameterByName('categories'),
          subcategories = getParameterByName('subcategories'),
          sortByRating = getParameterByName('sortByRating');
      filters = {
        flags: flags ? flags.split(',') : [],
        categories: categories ? categories.split(',') : [],
        subcategories: subcategories ? subcategories.split(',') : [],
        services: services ? services.split(',') : [],
        sortByRating: sortByRating === '',
        rating: -1,
        state: false
      };
    } else {
      filters = {
        flags: [],
        rating: -1,
        categories: [],
        subcategories: [],
        services: [],
        state: false,
        sortByRating: false
      };
      resetURL();
    }

    this.setState({
      query: '',
      results: this.state ? this.state.orgs : [],
      filters: filters
    });
  }

  loadCategories() {
    sheet.load(SPREADSHEET_ID, 2, rows => {
      this.setState({
        categories: rows.map(row => sheet.parseRow(row).category)
      });
    });
  }

  loadSubCategories() {
    sheet.load(SPREADSHEET_ID, 3, rows => {
      this.setState({
        subCategories: rows.map(row => sheet.parseRow(row)['sub-category'])
      });
    });
  }

  loadServices() {
    sheet.load(SPREADSHEET_ID, 4, rows => {
      this.setState({
        services: rows.map(row => sheet.parseRow(row).service)
      });
    });
  }

  loadOrgs() {
    sheet.load(SPREADSHEET_ID, 1, rows => {
      var orgs = _.chain(rows).map((row, i) => {
        var obj = sheet.parseRow(row);

        // skip if no name
        if (!obj.name) return;

        // some extra parsing
        obj.id = i;
        obj.rating = util.parseRating(obj.charitynavigatorrating);
        obj.deductible = util.parseBool(obj.taxdeductibleyn);
        obj.accredited = util.parseBool(obj.accreditedbusinessyn);
        obj.categories = _.compact([obj.category1, obj.category2, obj.category3]);
        obj.subcategories = _.compact([obj.subcategory1, obj.subcategory2]);
        obj.additionalServices = _.compact([obj.filter1, obj.filter2, obj.filter3]);
        obj.description = obj.description100characters;
        obj.donatelink = util.trim(obj.donatelink);
        obj.volunteerlink = util.trim(obj.volunteerlink);
        obj.number = util.parseNumber(obj.numbers);
        obj.services = [];
        if (obj.donatelink) obj.services.push('donations');
        if (obj.volunteerlink) obj.services.push('volunteers');
        obj.services = obj.services.concat(obj.additionalServices);

        // console.log(obj); // debug

        return obj;
      }).compact().value();
      this.setState({
        orgs: orgs,
        results: orgs,
        loading: false
      });
      search.index(orgs);
    });
  }

  updateAvailableFilters(results) {
    // TODO
    var filters = [];
    $('[data-flag=deductible]').attr('disabled', !_.some(results, r => r.deductible));
    $('[data-flag=accredited]').attr('disabled', !_.some(results, r => r.accredited));
    $('.filters-services button').each(function() {
      var service = $(this).data('service');
      $(this).attr('disabled',
        !_.some(results, r => _.contains(r.services, service)));
    });
    $('.filters-subcategories button').each(function() {
      var cat = $(this).data('subcategory');
      $(this).attr('disabled',
        !_.some(results, r => _.contains(r.subcategories, cat)));
    });
  }

  toggleFilterControls() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }

  toggleFilter(name, type) {
    var filters = this.state.filters;
    if (_.contains(filters[type], name)) {
      filters[type] = _.without(filters[type], name);
    } else {
      filters[type].push(name);
    }
    this.setState({
      filters: filters
    });

    var url = filters[type].length === 0 ? removeURLParameter(type) : updateURLParameter(type, filters[type]);
    window.history.replaceState('', '', url);
  }

  sortByRating() {
    var filters = this.state.filters;
    filters.sortByRating = !filters.sortByRating;
    this.setState({
      filters: filters
    });

    var url = filters.sortByRating ? updateURLParameter('sortByRating') : removeURLParameter('sortByRating', true);
    window.history.replaceState('', '', url);
  }

  search(query) {
    var results;
    if (query) {
      results = search.search(query).map(res => this.state.orgs[res.ref]);
    } else {
      results = this.state.orgs;
    }
    this.setState({
      query: query,
      results: results,
      showSearchResults: true
    });
  }

  render() {
    var header = (
      <div>
        <h1 className="title">Stand Together, Work Together</h1>
        <div className="search-wrapper" onMouseLeave={() => this.setState({showSearchResults: false})}>
          <input
            type="text"
            name="search"
            className="search-input"
            placeholder="Search for an organization by name, city, interest or action"
            aria-label="Search"
            onKeyUp={(ev) => this.search(ev.target.value)}/>
          <ul className="search-dropdown" style={{display: this.state.showSearchResults ? 'block' : 'none'}}>
            {this.state.results.slice(0, 5).map((res, i) => <li key={i} data-name={res.name} onClick={() => this.search(res.name)}>{res.name}</li>)}
          </ul>
        </div>
        <div className="filters filters-categories">
          {this.state.categories.map((cat, i) => <button
            key={i}
            className={_.contains(this.state.filters.categories, cat) ? 'selected' : ''}
            data-category={cat}
            onClick={() => this.toggleFilter(cat, 'categories')}>{cat}</button>)}
        </div>
      </div>
    );

    return (
      <div>
        <Header content={header} />
        <section className="filters-all">
          <div className="content">
            <div className="filters-controls">
              <button className="toggle-filters" onClick={this.toggleFilterControls.bind(this)}><i className="fa fa-sliders"></i> Filters</button>
              <button className="clear-filters" onClick={() => this.resetFilters(false)}><i className="fa fa-times"></i> Clear</button>
              <div className="filters-limit">
                <button
                  className={_.contains(this.state.filters.services, 'donations') ? 'selected' : ''}
                  onClick={() => this.toggleFilter('donations', 'services')}>Donations Only</button>
                <button
                  className={_.contains(this.state.filters.services, 'volunteers') ? 'selected' : ''}
                  onClick={() => this.toggleFilter('volunteers', 'services')}>Volunteer Only</button>
              </div>
            </div>
            <div className="filters-all-content" style={{display: this.state.showFilters ? 'block': 'none'}}>
              <div className="filters filters-subcategories">
                {this.state.subCategories.map((cat, i) => <button
                  key={i}
                  data-subcategory={cat}
                  className={_.contains(this.state.filters.subcategories, cat) ? 'selected' : ''}
                  onClick={() => this.toggleFilter(cat, 'subcategories')}>{cat}</button>)}
              </div>
              <div className="filters filters-services">
                {this.state.services.map((service, i) => <button
                  key={i}
                  data-service={service}
                  className={_.contains(this.state.filters.services, service) ? 'selected' : ''}
                  onClick={() => this.toggleFilter(service, 'services')}>{util.slugify(service)}</button>)}
              </div>
              <div className="filters-group">
                <div className="filters filters-flags">
                  <button
                    data-flag="deductible"
                    className={_.contains(this.state.filters.flags, 'deductible') ? 'selected' : ''}
                    onClick={() => this.toggleFilter('deductible', 'flags')}><i>$</i> Tax Deductible</button>
                  <button
                    data-flag="accredited"
                    className={_.contains(this.state.filters.flags, 'accredited') ? 'selected' : ''}
                    onClick={() => this.toggleFilter('accredited', 'flags')}><i>AB</i> Accredited Business</button>
                </div>
                <div className="filters filters-rating" onClick={this.sortByRating.bind(this)}>
                  <button className={this.state.filters.sortByRating ? 'selected': ''}><i className="fa fa-star"></i> Charity Navigator Score</button>
                </div>
              </div>
            <div className="collapse-filters" onClick={this.toggleFilterControls.bind(this)}>
              <i className="fa fa-caret-up" />
            </div>
            </div>
          </div>
        </section>
        <section className="results content">
          <ul>{this.renderResults()}</ul>
        </section>
        <Footer />
      </div>
    );
  }

  renderResults() {
    var results = search.filter(this.state.results, this.state.filters);
    this.updateAvailableFilters(results);
    if (this.state.loading) {
      return <h1 className="loading">Loading...</h1>;
    }
    if (results.length > 0) {
      return results.map(r => {
        return <Result key={r.id} {...r} />;
      });
    } else {
      return <h1 className="no-results" dangerouslySetInnerHTML={{__html: NO_RESULTS_COPY}} />;
    }
  }
}

export default List;
