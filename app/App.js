import $ from 'jquery';
import _ from 'underscore';
import util from './Util';
import render from './Render';
import search from './Search';


const SPREADSHEET_ID = '1kq6z9cEeqqGL5R5mdclkj5HjD-w9dvL8xCYmhG1UziQ';


class App {
  constructor() {
    this.flags = [];
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

        return obj;
      }).compact().value();
      onLoad();
    });
  }

  loadCategories() {
    this.loadSpreadsheet(2, rows => {
      this.categories = _.map(rows, row => {
        var cat = util.parseGSXRow(row).category;
        $('.filters-categories').append(`<li>${cat.replace(' ', '')}</li>`);
        return cat;
      });
    });
  }

  loadServices() {
    this.loadSpreadsheet(3, rows => {
      this.services = _.map(rows, row => {
        var service = util.parseGSXRow(row).service,
            serviceSlug = service.replace(' ', '').replace('-', '');
        $('.filters-services').append(`<li>${serviceSlug}</li>`);
        return service;
      });
    });
  }

  bindRatingFilter() {
    var selector = '.charitynavigatorscore-filter i';
    $(selector).on('mouseenter', ev => {
      var idx = $(ev.target).index();
      $(selector).each(function(i) {
        if (i <= idx) {
          $(this).removeClass('fa-circle-o').addClass('fa-star');
        } else {
          $(this).removeClass('fa-star').addClass('fa-circle-o');
        }
      });
    }).on('mouseleave', ev => {
      $(selector).removeClass('fa-star').addClass('fa-circle-o');
    });
  }

  bindFlagFilters() {
    $('.filters-flags li').on('click', ev => {
      var el = $(ev.target),
          flag = el.data('flag');
      el.toggleClass('selected');
      if (el.hasClass('selected')) {
        this.flags.push(flag);
      } else {
        this.flags = _.without(this.flags, flag);
      }
      this.renderResults();
    });
  }

  renderResults() {
    var html = [],
        results = search.filter(this.orgs, this.flags);
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

    this.bindRatingFilter();
    this.bindFlagFilters();
  }
}

export default App;
