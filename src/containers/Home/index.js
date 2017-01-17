import React, { Component } from 'react';
import './style.scss';
import { browserHistory } from 'react-router';
import ArrowDownIcon from './icons/arrow_down.png';
import ArrowUpIcon from './icons/arrow_up.png';
import SearchIcon from './icons/search.png';
import FilterIcon from './icons/filter.png';
import Loading from '../../components/Loading';

class Home extends Component {
  
   // static propTypes = { }
   // static defaultProps = {}
   state = {
      sourceList: [],
      sourceValue: '',
      selectedSource: {},
      sortByValue: '',
      sortByValueList: [],
      categoryValue: '',
      countryValue: '',
      countryList: [],
      categoryList: [],
      openCountrySelect:false,
      openCategorySelect:false,
      loadingSource: true,
      toggleFilterClass: false,
      sortBySource: ''
   }
  
  constructor(props) {
      super(props);

      this.NewsApiHost = 'https://newsapi.org/v1/';
      this.NewsSourceApiUrl = `${this.NewsApiHost}sources?language=en`;

      this.sourcesData = [];
      this.countryNameWithCode = {
          au: 'Australia',
          it: 'Italy',
          gb: 'United Kingdom',
          in: 'India',
          us: 'United States of America'
      };
  }

  _getSource() {
      return fetch(this.NewsSourceApiUrl).then(res => res.json(), this._errorHandler);
  }

  componentWillMount() {
    
    browserHistory.listen( location =>  {
    //    var params=
    });       
  }

  componentWillReceiveProps (nextProps) {
      const { source_id, source_sortBy } = nextProps.params;
      if(source_id !== this.props.params.source_id) {
          this._updateStateOnLocationChange(source_id, source_sortBy);
      }
  }
  
  componentDidMount() {
        this._getSource().then(source_data => {
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

            this.setState({
                countryList: countriesWithUnique,
                sourceList: sources,
                loadingSource: false,
                categoryList: categoriesWithUnique
            });     
            this._selectDefaultSourceOrWithParams(this.props.params);
        });
  }
  
  _selectDefaultSourceOrWithParams(params) {
    const { source_id, source_sortBy } = params;
    console.log('params', params)
    const sources = this.sourcesData;
    let selectedSource = sources[1] || {};
    let sortBySource = selectedSource.sortBysAvailable.includes('latest') ? 'latest' : 'top';
    console.log('source_by_id', source_id);
    // get source by params value
    if(source_id && source_sortBy) {
        sources.forEach((source_by_id, index)=>{
            if(source_by_id.id === source_id) {
                selectedSource = source_by_id;
                sortBySource = source_by_id.sortBysAvailable.includes(source_sortBy) ? source_sortBy : source_by_id.sortBysAvailable[0]
            }
        });
    }
    this.setState({
        sourceValue: selectedSource.id,
        selectedSource,
        sortBySource,
    });
  }

  _updateStateOnLocationChange(source_id, source_sortBy) {
    const { sourceList, toggleFilterClass } = this.state;
    const source_by_id = sourceList.filter(source=>{
        return source.id === source_id;
    })[0];
    console.log('source_by_id', source_by_id);
    // source_by_id is not undifined
    if(source_by_id) {
        const { sortBysAvailable } = source_by_id;
        source_sortBy = sortBysAvailable.includes(source_sortBy) ? source_sortBy : sortBysAvailable[0];
        this.setState({
            sourceValue: source_id,
            sortBySource: source_sortBy,
            selectedSource: source_by_id,
            toggleFilterClass: toggleFilterClass && false,
            isSortByOpen: false
        });
    } else {
        this._selectDefaultSourceOrWithParams({source_id, source_sortBy});
    }
  }

  onSourceChange(source) {
    let sortBySource = source.sortBysAvailable.includes('latest') ? 'latest' : 'top';
    browserHistory.push(`${source.id}/${sortBySource}`);
    window.scroll(0,0);
  }

  onCategoryChange(value) {
    const sourceByCategory = this.sourcesData.filter(source=>{
        if(this.state.countryValue) {
            return source.category === value && source.country === this.state.countryValue;
        } else {
            return source.category === value;
        }
    });

    this.setState({
        sourceList: sourceByCategory || [],
        categoryValue: value,
        openCategorySelect: false
    });
  }

  onCountryChange(value) {
    const sourceByCountry = this.sourcesData.filter(source=>{
       if(this.state.categoryValue) {
           return source.country === value && source.category === this.state.categoryValue;
       } else {
           return source.country === value;
       }
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
        let souceListFilterData = this.sourcesData;
        const { categoryValue } = this.state;
        if(categoryValue) {
            souceListFilterData = this.sourcesData.filter(source=>{
                return source.category === categoryValue;
            });
        }
        this.setState({
            countryValue: '',
            openCountrySelect: false,
            sourceList: souceListFilterData
        });
  }
  resetCategorySelect() {
        let souceListFilterData = this.sourcesData;
        const { countryValue } = this.state;
        if(countryValue) {
            souceListFilterData = this.sourcesData.filter(source=>{
                return source.country === countryValue;
            });
        }
        this.setState({
            categoryValue: '',
            openCategorySelect: false, 
            sourceList: souceListFilterData
        });
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

  render() {
    const { loadingSource, toggleFilterClass, sortBySource, countryList, categoryList, openCategorySelect, openCountrySelect, sourceList, sourceValue, selectedSource, countryValue, categoryValue } = this.state;

    // render child component with parent props
    function renderChildren(props, apiHostUrl, selectedSource, sortBySource, countryNameWithCode) {
        return React.Children.map(props.children, child => {
                    return React.cloneElement(child, {
                        apiHostUrl,
                        selectedSource,
                        sortBySource,
                        countryNameWithCode
                    })
                });
    }

    return (
      <div className="news container">
          <aside className={`news-tab__filter columns three ${toggleFilterClass && 'news-tab__filter--show'}`}>
                <section className="news-tab__filter__header">
                    <ul className="list-inline news-tab__filter__header__tab">
                        <li onClick={this.onOpenCountrySelect.bind(this)}>
                            <label className="ellipsis">{ this.countryNameWithCode[countryValue] || 'All Country'}</label>
                            <img class="icon u-pull-right" src={openCountrySelect ? ArrowUpIcon : ArrowDownIcon } />
                        </li>
                        <li onClick={this.onOpenCategorySelect.bind(this)}>
                            <label className="ellipsis">{ categoryValue || 'All Category'}</label>
                            <img class="icon u-pull-right" src={openCategorySelect ? ArrowUpIcon : ArrowDownIcon } />
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
                        <img src={SearchIcon} className="icon" />
                    </div>
                    {
                        loadingSource ? <Loading /> :
                        <ul className="list-inline news-tab__filter__content__list">
                            {
                                sourceList.length ? sourceList.map((source, index)=>
                                    <li className="news-tab__filter__content__source-box">
                                        <div className={source.id === sourceValue ? 'active' : ''} onClick={this.onSourceChange.bind(this, source, index)}>
                                            <img className="img-scale" src={source.urlsToLogos.small} />
                                            <span>{source.name}</span>
                                            <label className="text-captalize">{source.category}</label>
                                        </div>
                                    </li>
                                ) : <li><h6 className="text-center">No data available</h6></li>
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
                                                <span className="text-captalize">{source.category}</span><span className="text-uppercase"> ({source.country})</span>
                                            </div>
                                        </li>
                                    )
                                }
                            </ul>
                }
                {renderChildren(this.props, this.NewsApiHost, selectedSource, sortBySource, this.countryNameWithCode)}
              </div>
        </div>
        <button type="button" className="toggle-filter-btn" onClick={this.toggleFilter.bind(this)}>
          <img src={ FilterIcon } />
        </button>
      </div>
    );
  }
}

export default Home;
