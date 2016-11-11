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

        console.log(obj.categories);

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
          `<li data-category="${cat}">${util.slugify(cat)}</li>`);
        return cat;
      });
    });
  }

  loadServices() {
    this.loadSpreadsheet(3, rows => {
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

  bindClearFilters() {
    $('.action-clear').on('click', ev => {
      this.resetFilters();
      this.renderResults();
      this.renderRatingFilter();
      $('.selected').removeClass('selected');
    });
  }

  renderResults() {
    var html = [],
        results = search.filter(this.orgs, this.filters);
    _.each(results, result => {
      html.push(render.result(result));
    });
    $('.results > ul').html(html.join(''));
  }

  run() {
    this.loadOrgs(() => {
      this.renderResults();
    });
    this.loadCategories();
    this.loadServices();

    this.bindClearFilters();
    this.bindRatingFilter();
    this.bindFilter('.filters-flags', 'flag', 'flags');
    this.bindFilter('.filters-categories', 'category', 'categories');
    this.bindFilter('.filters-services', 'service', 'services');
  }
}

export default App;
