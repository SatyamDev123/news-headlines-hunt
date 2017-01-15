import React, { Component } from 'react';
import './style.scss';
import ArrowDownSVG from './icons/arrow_down.svg';
import ArrowUpSVG from './icons/arrow_up.svg';
import SearchSVG from './icons/search.svg';
import FilterSVG from './icons/filter.svg';
import CloseSVG from './icons/close.svg';
import Loading from '../../components/Loading';

class NewsTab extends Component {
  // static propTypes = {}
  // static defaultProps = {}
  state = {
      sourceList: [],
      newsList: [],
      sourceValue: '',
      selectedSource: {},
      nextSelectSource:{},
      nextSelectSourceIndex:0,
      sortByValue: '',
      sortByValueList: [],
      categoryValue: '',
      countryValue: '',
      countryList: [],
      categoryList: [],
      openCountrySelect:false,
      openCategorySelect:false,
      loadingSource: true,
      loadingNews: true,
      toggleFilterClass: false,
      isSortByOpen: false
  }

  constructor(props) {
      super(props);
      const NewsApiKey = 'e8c3f38da1034868800b086b12238a54';
      this.NewsApiHost = 'https://newsapi.org/v1/';
      this.NewsArticleApiUrl = `${this.NewsApiHost}articles?apiKey=${NewsApiKey}`;
      this.NewsSourceApiUrl = `${this.NewsApiHost}sources?language=en`;
      this.sortByList = [
          {label:'top', value:'top'},
          {label:'latest', value:'latest'}
      ];
      this.sourcesData = [];
      this.countryNameWithCode = {
          au: 'Australia',
          it: 'Italy',
          gb: 'United Kingdom',
          in: 'India',
          us: 'United States of America'
      };
  }

  _errorHandler(error) {
      console.log('fetch faild', error);
  }
  _getNewsByQuery(url, source, sortBy, country, category) {
      let requestUrl = `${url}&source=${source}&sortBy=${sortBy}`;
      if(country) {
        requestUrl = country && `${requestUrl}&country=${country}`;
      }
      if(category) {
          requestUrl = category && `${requestUrl}&category=${category}`;
      }
      return fetch(requestUrl).then(res => res.json(), this._errorHandler);
  }

  _getSource() {
      return fetch(this.NewsSourceApiUrl).then(res => res.json(), this._errorHandler);
  }

  componentDidMount() {
      this._getSource().then(source_data=>{
        const { sources } = source_data;
        this.sourcesData = sources;
        
        const categoriesWithUnique =  sources.map(source=>{
            return source.category;
        }).filter((source,index,self)=>{
            return index === self.indexOf(source);
        });

        const countriesWithUnique =  sources.map(country=>{
            return country.country;
        }).filter((country,index,self)=>{
            return index === self.indexOf(country);
        });
        const firstSource = sources[1] || {};
        const nextSelectSource = sources.length > 2 ? sources[2] : {};
        const sourceValue = firstSource.id;
        const selectedSource = firstSource;
        const sortByValue = firstSource.sortBysAvailable.includes('latest') ? 'latest' : 'top';
        const sortByValueList = firstSource.sortBysAvailable;
        this.setState({
            countryList: countriesWithUnique,
            sourceList: sources,
            sourceValue,
            loadingSource: false,
            selectedSource
        });
        this._getNewsByQuery(this.NewsArticleApiUrl, sourceValue, sortByValue).then(news_data=>{
            this.setState({
                newsList: news_data.articles,
                categoryList: categoriesWithUnique,
                sortByValueList: sortByValueList,
                sortByValue,
                loadingNews: false,
                nextSelectSource,
                nextSelectSourceIndex: nextSelectSource.id && 2
            });
        });
        
      });
  }

  onSourceChange(source, index) {
      console.log('index',index);
    const { id, sortBysAvailable } = source;
    const { sourceList, toggleFilterClass } = this.state;
    const nextIndex = index + 1;
    const isNextSourceAvailable = sourceList.length > (nextIndex) ? true : false;
    this.setState({
        sourceValue: id,
        selectedSource: source,
        loadingNews: true,
        toggleFilterClass: toggleFilterClass && false,
        isSortByOpen: false
    });
    // scroll top
    window.scroll(0, 0);
    this._getNewsByQuery(this.NewsArticleApiUrl, id, sortBysAvailable[0]).then(news_data=>{
         this.setState({
            newsList: news_data.articles,
            sortByValue: sortBysAvailable.includes('latest') ? 'latest' : 'top',
            sortByValueList: sortBysAvailable,
            loadingNews: false,
            nextSelectSource: isNextSourceAvailable ? sourceList[nextIndex] : {},
            nextSelectSourceIndex: nextIndex
        });
     })
  }
  onSortByChange(value) {
     this.setState({
        sortByValue: value,
        loadingNews: true,
        isSortByOpen: true
     });
     this._getNewsByQuery(this.NewsArticleApiUrl, this.state.sourceValue, value).then(news_data=>{
         this.setState({
            newsList: news_data.articles,
            loadingNews: false
        });
     })
  }

  onCategoryChange(value) {
    const sourceByCategory = this.sourcesData.filter(source=>{
        return source.category === value;
    });

    this.setState({
        sourceList: sourceByCategory || [],
        categoryValue: value,
        openCategorySelect: false
    });
  }

  onCountryChange(value) {
    const sourceByCountry = this.sourcesData.filter(source=>{
        return source.country === value;
    });

    this.setState({
        sourceList: sourceByCountry || [],
        countryValue: value,
        openCountrySelect: false
    });
  }

  onOpenCountrySelect() {
      this.setState({
          openCategorySelect:false,
          openCountrySelect: !this.state.openCountrySelect
      })
  }
  
  onOpenCategorySelect() {
      this.setState({
          openCategorySelect: !this.state.openCategorySelect,
          openCountrySelect:false
      })
  }
  resetCountrySelect() {
      this.setState({
            countryValue: '',
            openCountrySelect: false,
            sourceList: this.sourcesData
      })
  }
  resetCategorySelect() {
      this.setState({
            categoryValue: '',
            openCategorySelect: false, 
            sourceList: this.sourcesData
      })
  }
  filterSourcesByValue(event) {
      const value = event.target.value;
      const copySourceData = [].concat(this.sourcesData);
      const filteredSources =  copySourceData.filter(source=>{
          return source.id.indexOf(value) !== -1 || source.name.indexOf(value) !== -1;
      });
      this.setState({
          sourceList: filteredSources
      });
  }

  toggleFilter () {
      this.setState({
          toggleFilterClass: !this.state.toggleFilterClass
      })
  }

  dateToStr (date) {
    // TIP: to find current time in milliseconds, use:
    let  current_time_milliseconds = new Date().getTime();
    let date_milliseconds = new Date(date).getTime();
    let milliseconds = current_time_milliseconds - date_milliseconds;
    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    let temp = Math.floor(milliseconds / 1000);
    let years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    let days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    let hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    let minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    let seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}

  
  render() {
    const { loadingSource, toggleFilterClass, nextSelectSource, nextSelectSourceIndex, isSortByOpen, loadingNews, countryList, categoryList, sortByValueList, openCategorySelect, openCountrySelect, sourceList, newsList, sourceValue, selectedSource, sortByValue, countryValue, categoryValue } = this.state;
    return (
      <div className="news container">
          <aside className={`news-tab__filter columns three ${toggleFilterClass && 'news-tab__filter--show'}`}>
                <section className="news-tab__filter__header">
                    <ul className="list-inline news-tab__filter__header__tab">
                        <li onClick={this.onOpenCountrySelect.bind(this)}>
                            <label className="ellipsis">{ this.countryNameWithCode[countryValue] || 'All Country'}</label>
                            <img class="icon u-pull-right" src={openCountrySelect ? ArrowUpSVG : ArrowDownSVG  } />
                        </li>
                        <li onClick={this.onOpenCategorySelect.bind(this)}>
                            <label className="ellipsis">{ categoryValue || 'All Category'}</label>
                            <img class="icon u-pull-right" src={openCategorySelect ? ArrowUpSVG : ArrowDownSVG } />
                        </li>
                    </ul>
                    {
                        openCategorySelect && 
                        <ul className="categoy news-tab__filter__header__select">
                            <li onClick={this.resetCategorySelect.bind(this)}>
                            <span>All Category</span>
                            </li>
                            {
                                categoryList.map(categoyChip=>
                                    <li onClick={this.onCategoryChange.bind(this, categoyChip)}>
                                        <span>{categoyChip}</span>
                                    </li>
                                )
                            }
                        </ul>
                    }
                    {
                        openCountrySelect && 
                        <ul className="news-tab__filter__header__select">
                            <li onClick={this.resetCountrySelect.bind(this)}>
                                <span>All Country</span>
                            </li>
                            {
                                countryList.map(countryChip=>
                                    <li onClick={this.onCountryChange.bind(this, countryChip)}>
                                            <span>{ this.countryNameWithCode[countryChip] }</span>
                                    </li>
                                )
                            }
                        </ul>
                    }
                </section>
                <section className="news-tab__filter__content">
                    <div className="news-tab__filter__content__search-input">
                        <input placeholder="Search source" type="text" onChange={ this.filterSourcesByValue.bind(this) } />
                        <img src={SearchSVG} className="icon" />
                    </div>
                    {
                        loadingSource ? <Loading /> :
                        <ul className="list-inline news-tab__filter__content__list">
                            {
                                sourceList.map((source, index)=>
                                    <li className="news-tab__filter__content__source-box">
                                        <div className={source.id === sourceValue ? 'active' : ''} onClick={this.onSourceChange.bind(this, source, index)}>
                                            <img className="img-scale" src={source.urlsToLogos.small} />
                                            <span>{source.name}</span>
                                        </div>
                                    </li>
                                )
                            }
                        </ul>
                    }
                </section>
                
          </aside>
          <div className="news-tab__content nine columns offset-by-three">  
                <div className="news-tab__content__header">
                    <h1 className="text-center">News Headlines Hunt</h1>
                    <hr />
                </div>
                <div className="news-tab__content__list">
                    {
                        !loadingSource && <ul className="list-inline news-tab__content__sources-list">
                                    {
                                        sourceList.map((source, index)=>
                                            <li className={selectedSource.id === source.id ? 'active' : ''} onClick={this.onSourceChange.bind(this, source, index)}>
                                                <div>
                                                    <label>{source.name}</label>
                                                    <span>{this.countryNameWithCode[source.country]}</span>
                                                </div>
                                            </li>
                                        )
                                    }
                                </ul>
                    }
                    {
                        (!loadingNews || isSortByOpen) &&
                            <div className="news-tab__content__sortBy">
                                <a href={selectedSource.url} target="blank" className="source-name text-center">{selectedSource.name}</a>
                                <div className="sortBy-btn-list">
                                    {
                                        sortByValueList.map(sort=>
                                            <button className={sort===sortByValue ? 'active' : 'btn btn-secondary'} onClick={this.onSortByChange.bind(this, sort)}>{sort}</button>
                                        )
                                    }
                                </div>
                            </div>
                    }
                    {
                        loadingNews ? <Loading /> : newsList.map((news, index)=>
                            <a href={news.url} target="blank" key={`news${index}`} className="news-article-link">
                                <section className="container news-tab__content__card">
                                    <div className="columns three news-tab__content__card__image">
                                        <img src={news.urlToImage} className="img-scale" />
                                        <span className="u-pull-left">{selectedSource.name}</span>
                                        <span className="text-muted u-pull-right">{this.dateToStr(news.publishedAt)}</span>
                                    </div>
                                    <div className="columns nine news-tab__content__card__details">
                                        <h3>{news.title}</h3>
                                        <p className="">{news.description}</p>
                                    </div>
                                </section>
                            </a>
                        )
                    }
                </div>
                {
                    nextSelectSource.name && <div className="next_news text-center">
                                                <button type="button" onClick={this.onSourceChange.bind(this, nextSelectSource, nextSelectSourceIndex)}>Next {nextSelectSource.name}</button>
                                            </div>
                }
                <div className="news__footer">
                    <div>
                        <span>Made by </span> <a href=  "https://satyamdev.firebaseapp.com" target="blank"><b>Satyam Dev</b></a>
                    </div>
                    <div>
                        <span>news powered by </span><a href="https://newsapi.org" target="blank"><b>newsapi.org</b></a>
                    </div>
                </div>
          </div> 
          <button type="button" className="toggle-filter-btn" onClick={this.toggleFilter.bind(this)}>
            <img src={ toggleFilterClass ? CloseSVG : FilterSVG } className={`${toggleFilterClass && 'icon-close'}`} />
          </button>
      </div>
    );
  }
}

export default NewsTab;