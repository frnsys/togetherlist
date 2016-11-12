import $ from 'jquery';
import _ from 'underscore';
import util from './Util';
import render from './Render';
import search from './Search';


const SPREADSHEET_ID = '1kq6z9cEeqqGL5R5mdclkj5HjD-w9dvL8xCYmhG1UziQ';


class App {
  constructor() {
    this.resetFilters();
  }

  resetFilters() {
    this.filters = {
      flags: [],
      rating: -1,
      categories: [],
      services: []
    };
  }

  loadSpreadsheet(num, onLoad) {
    var url = `https://spreadsheets.google.com/feeds/list/${SPREADSHEET_ID}/${num}/public/full?alt=json`;
    $.ajax({
      url: url,
      success: data => onLoad(data.feed.entry)
    });
  }

  loadOrgs(onLoad) {
    this.loadSpreadsheet(1, rows => {
      this.orgs = _.chain(rows).map(row => {
        var obj = util.parseGSXRow(row);

        // skip if no name
        if (!obj.name) return;

        // some extra parsing
        obj.rating = util.parseRating(obj.charitynavigatorrating);
        obj.deductible = util.parseBool(obj.taxdeductibleyn);
        obj.accredited = util.parseBool(obj.accreditedbusinessyn);
        obj.categories = _.compact([obj.category1, obj.category2, obj.category3]);
        obj.services = _.compact([obj.filter1, obj.filter2, obj.filter3]);
        obj.description = obj.description100characters;
        if (obj.donatelink) obj.services.push('donations');
        if (obj.volunteerlink) obj.services.push('volunteers');

        console.log(obj); // debug

        return obj;
      }).compact().value();
      onLoad();
    });
  }

  loadCategories() {
    this.loadSpreadsheet(2, rows => {
      this.categories = _.map(rows, row => {
        var cat = util.parseGSXRow(row).category;
        $('.filters-categories').append(
          `<li data-category="${cat}" title="${util.slugify(cat)}">${util.slugify(cat)}</li>`);
        return cat;
      });
    });
  }

  loadSubCategories() {
    this.loadSpreadsheet(3, rows => {
      this.categories = _.map(rows, row => {
        var cat = util.parseGSXRow(row)['sub-category'];
        $('.filters-subcategories').append(
          `<li data-subcategory="${cat}">${cat}</li>`);
        return cat;
      });
    });
  }

  loadServices() {
    this.loadSpreadsheet(4, rows => {
      this.services = _.map(rows, row => {
        var service = util.parseGSXRow(row).service;
        $('.filters-services').append(
          `<li data-service="${service}">${util.slugify(service)}</li>`);
        return service;
      });
    });
  }

  bindRatingFilter() {
    $('.filters-rating i').on('mouseenter', ev => {
      var idx = $(ev.target).index();
      this.renderRatingFilter(idx);
    }).on('mouseleave', ev => {
      this.renderRatingFilter(this.filters.rating);
    }).on('click', ev => {
      var idx = $(ev.target).index();
      this.filters.rating = idx+1;
      this.renderResults();
    });

    $('.filters-rating-reset').on('mouseenter', ev => {
      this.renderRatingFilter(-1);
    }).on('mouseleave', ev => {
      this.renderRatingFilter(this.filters.rating);
    }).on('click', ev => {
      this.filters.rating = -1;
      this.renderResults();
    });
  }

  renderRatingFilter(n_stars) {
    var selector = '.filters-rating i';
    $(selector).each(function(i) {
      if (i <= n_stars) {
        $(this).removeClass('fa-circle-o').addClass('fa-star');
      } else {
        $(this).removeClass('fa-star').addClass('fa-circle-o');
      }
    });
  }

  bindFilter(sel, dataName, filterType) {
    $(sel).on('click', 'li', ev => {
      var el = $(ev.target),
          filter = el.data(dataName);
      el.toggleClass('selected');
      if (el.hasClass('selected')) {
        this.filters[filterType].push(filter);
      } else {
        this.filters[filterType] = _.without(this.filters[filterType], filter);
      }
      this.renderResults();
    });
  }

  bindClear() {
    $('.clear-filters').on('click', ev => {
      this.results = this.orgs;
      this.resetFilters();
      this.renderResults();
      this.renderRatingFilter();
      $('.selected').removeClass('selected');
      $('input[name=search]').val('');
    });
  }

  bindSearch() {
    $('input[name=search]').on('keyup', ev => {
      this.search();
    });
  }

  bindFiltersToggle() {
    $('.toggle-filters').on('click', ev => {
      $('.filters-all-content').toggle();
    });
  }

  search() {
    var query = $('input[name=search]').val();
    if (query) {
      this.results = _.map(search.search(query), res => {
        return this.orgs[res.ref];
      });
      this.renderResults();
    }
  }

  renderResults() {
    var html = [],
        results = search.filter(this.results, this.filters);
    if (results.length > 0) {
      _.each(results, result => {
        html.push(render.result(result));
      });
      $('.results > ul').html(html.join(''));
    } else {
      $('.results > ul').html('<h1 class="no-results">No results</h1>');
    }
  }

  run() {
    this.loadOrgs(() => {
      this.results = this.orgs;
      this.renderResults();
      search.index(this.orgs);
    });
    this.loadServices();
    this.loadCategories();
    this.loadSubCategories();

    this.bindSearch();
    this.bindClear();
    this.bindRatingFilter();
    this.bindFiltersToggle();
    this.bindFilter('.filters-flags', 'flag', 'flags');
    this.bindFilter('.filters-categories', 'category', 'categories');
    this.bindFilter('.filters-services', 'service', 'services');
  }
}

export default App;
