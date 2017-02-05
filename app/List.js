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
    this.resetFilters();
    this.loadOrgs();
    this.loadServices();
    this.loadCategories();
    this.loadSubCategories();
  }

  resetFilters() {
    this.setState({
      query: '',
      results: this.state ? this.state.orgs : [],
      filters: {
        flags: [],
        rating: -1,
        categories: [],
        subcategories: [],
        services: [],
        state: false,
        sortByRating: false
      }
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
  }

  sortByRating() {
    var filters = this.state.filters;
    filters.sortByRating = !filters.sortByRating;
    this.setState({
      filters: filters
    });
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
          <input type="text" name="search" className="search-input" placeholder="Search for an organization by name, city, interest or action" aria-label="Search" onKeyUp={(ev) => this.search(ev.target.value)}/>
          <ul className="search-dropdown" style={{display: this.state.showSearchResults ? 'block' : 'none'}}>
            {this.state.results.slice(0, 5).map((res, i) => <li key={i} data-name={res.name} onClick={() => this.search(res.name)}>{res.name}</li>)}
          </ul>
        </div>
        <div className="filters filters-categories">
          {this.state.categories.map((cat, i) => <button key={i} data-category={cat} onClick={() => this.toggleFilter(cat, 'categories')}>{cat}</button>)}
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
              <button className="clear-filters" onClick={this.resetFilters.bind(this)}><i className="fa fa-times"></i> Clear</button>
            </div>
            <div className="filters-all-content" style={{display: this.state.showFilters ? 'block': 'none'}}>
              <div className="filters filters-subcategories">
                {this.state.subCategories.map((cat, i) => <button key={i} data-subcategory={cat} onClick={() => this.toggleFilter(cat, 'subcategories')}>{cat}</button>)}
              </div>
              <div className="filters-group">
                <div className="filters filters-flags">
                  <button data-flag="deductible" onClick={() => this.toggleFilter('deductible', 'flags')}>Tax Deductible</button>
                  <button data-flag="accredited" onClick={() => this.toggleFilter('accredited', 'flags')}>Accredited Business</button>
                </div>
                <div className="filters filters-rating" onClick={this.sortByRating.bind(this)}>
                  <button className={this.state.filters.sortByRating ? 'selected': ''}>Sort by Charity Navigator Score</button>
                </div>
              </div>
              <div className="filters filters-services">
                {this.state.services.map((service, i) => <button key={i} data-service={service} onClick={() => this.toggleFilter(service, 'services')}>{util.slugify(service)}</button>)}
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
