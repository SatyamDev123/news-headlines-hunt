import React, { Component } from 'react';
import './style.scss';
import { browserHistory } from 'react-router';
import ArrowDownIcon from './icons/arrow_down.png';
import ArrowUpIcon from './icons/arrow_up.png';
import SearchIcon from './icons/search.png';
import FilterIcon from './icons/filter.png';
import Loading from '../../components/Loading';
import HorizantalScrollList from '../../components/HorizantalScrollList';

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
    const sources = this.sourcesData;
    let selectedSource = sources[1] || {};
    let sortBySource = selectedSource.sortBysAvailable.includes('latest') ? 'latest' : 'top';
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
    window.scroll(0,0);
  }

  onSourceChange(source) {
    let sortBySource = source.sortBysAvailable.includes('latest') ? 'latest' : 'top';
    browserHistory.push(`${source.id}/${sortBySource}`);
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
        <div className="nhh">
            <header className="nhh__header">
                <section className="container">
                <h1 className="brand-name">News Headlines Hunt</h1>
                </section>
            </header>
            <nav className="nhh__nav-filter">
            <div className="nhh__nav-filter__tab nhh__nav-filter__tab--country">
                    <HorizantalScrollList classNameValue="nhh__nav-filter__tab--country__list">
                        {
                            countryList.map(countryChip=>
                                <li className={countryChip === countryValue ? 'active' : ''} onClick={this.onCountryChange.bind(this, countryChip)}>
                                        <span className="text-uppercase">{ this.countryNameWithCode[countryChip] }</span>
                                </li>
                            )
                        }
                    </HorizantalScrollList>
            </div>
            <div className="nhh__nav-filter__tab nhh__nav-filter__tab--category">
                <HorizantalScrollList classNameValue="nhh__nav-filter__tab--category__list">
                    {
                        categoryList.map(categoyChip=>
                            <li className={categoyChip === categoryValue ? 'active' : ''} onClick={this.onCategoryChange.bind(this, categoyChip)}>
                                <span className="text-uppercase">{categoyChip}</span>
                            </li>
                        )
                    }
                </HorizantalScrollList>
            </div>
            <div className="nhh__nav-filter__tab--source">
                <HorizantalScrollList classNameValue="nhh__nav-filter__tab--source__list">
                        {
                            sourceList.map((source, index)=>
                                <li className={source.id === sourceValue ? 'active' : ''} onClick={this.onSourceChange.bind(this, source, index)}>
                                    <div style={`background-image:url(${source.urlsToLogos.medium})`} className="filter__tab--source__box">
                                    </div>
                                    <div className="filter__tab--source__label">
                                        <span>{source.name}</span>
                                    </div>
                                </li>
                            ) 
                        }
                        {
                            (!loadingSource && !sourceList.length) && <li className="empty-source"><span className="text-brand">No news source available</span></li>
                        }
                </HorizantalScrollList>
            </div>
            </nav>
            {renderChildren(this.props, this.NewsApiHost, selectedSource, sortBySource, this.countryNameWithCode)}
            <footer className="nhh__footer">
                <section>
                    <span>Made by </span> <a href="https://satyamdev.firebaseapp.com" target="blank"><b>Satyam Dev</b></a>
                    <div>
                        <span>news powered by </span><a href="https://newsapi.org" target="blank"><b>newsapi.org</b></a>
                    </div>
                </section>
            </footer>
      </div>
    );
  }
}

export default Home;
