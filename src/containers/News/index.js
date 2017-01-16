import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import './style.scss';
import Loading from '../../components/Loading';
import shallowCompare from 'preact-shallow-compare';

class NewsTab extends Component {
  // static propTypes = {}
  // static defaultProps = {}
    state = {
        newsList: [],
        loadingNews: true,
        isSortByOpen: false
    }

    constructor(props) {
        super(props);
        const NewsApiKey = 'e8c3f38da1034868800b086b12238a54';
        this.NewsArticleApiUrl = `${props.apiHostUrl}articles?apiKey=${NewsApiKey}`;
    }

    _errorHandler(error) {
        console.log('fetch faild', error);
    }
    _getNewsByQuery(url, source, sortBy) {
        let requestUrl = `${url}&source=${source}&sortBy=${sortBy}`;
        return fetch(requestUrl).then(res => res.json(), this._errorHandler);
    }

    _updateStateWithNewsByQuery(selectedSource, nextSelectSource, sortBySource) {
        selectedSource.id && this._getNewsByQuery(this.NewsArticleApiUrl, selectedSource.id, sortBySource).then(news_data=>{
            this.setState({
                newsList: news_data.articles,
                sortByValueList: selectedSource.sortBysAvailable,
                sortByValue: sortBySource,
                loadingNews: false,
                nextSelectSource
            });
        });      
    }

    componentDidMount() {
        const { selectedSource, nextSelectSource, sortBySource } = this.props;
        this._updateStateWithNewsByQuery(selectedSource, nextSelectSource, sortBySource);
        // window.scroll(0, 0);
    }
    componentWillReceiveProps(nextProps) {
        const { selectedSource, nextSelectSource, sortBySource } = nextProps;
        // check if selected source props has changed
        if(selectedSource.id !== (this.props.selectedSource.id && this.props.selectedSource.id)) {
            this.setState({
                loadingNews: true
             })
            this._updateStateWithNewsByQuery(selectedSource, nextSelectSource, sortBySource);
        }
    }
    shouldComponentUpdate (nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }    

    onSortByChange(value) {
        const sourceValue = this.props.selectedSource.id;
        this.setState({
            sortByValue: value,
            loadingNews: true,
            isSortByOpen: true
        });
        this._getNewsByQuery(this.NewsArticleApiUrl, sourceValue, value).then(news_data=>{
            this.setState({
                newsList: news_data.articles,
                loadingNews: false
            });
        });
        browserHistory.push(`${sourceValue}/${value}`);
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
        const { isSortByOpen, loadingNews, sortByValueList, newsList, sourceValue, sortByValue } = this.state;
        const { selectedSource, nextSelectSource, nextSelectSourceIndex, countryNameWithCode } = this.props;

        return (
            <div> 
                {
                    (!loadingNews || isSortByOpen) &&
                        <div className="news-tab__content__sortBy">
                            <a href={selectedSource.url} target="blank" className="source-name text-center">{selectedSource.name} <span className="text-captalize"> ({countryNameWithCode[selectedSource.country]})</span></a>
                            <div className="sortBy-btn-list">
                                {
                                    sortByValueList.map(sort=>
                                        <button className={sort===sortByValue ? 'active' : 'btn btn-secondary'} onClick={this.onSortByChange.bind(this, sort)}>{sort}</button>
                                    )
                                }
                            </div>
                        </div>
                }
                <div className="news-tab__content__list_article">
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
                    nextSelectSource && nextSelectSource.name && <div className="next_news text-center">
                                                <button type="button" onClick={this.props.handlerSourceChange.bind(null, nextSelectSource, nextSelectSourceIndex)}>Next {nextSelectSource.name}</button>
                                            </div>
                }
                <div className="news__footer">
                    <div>
                        <span>Made by </span> <a href="https://satyamdev.firebaseapp.com" target="blank"><b>Satyam Dev</b></a>
                    </div>
                    <div>
                        <span>news powered by </span><a href="https://newsapi.org" target="blank"><b>newsapi.org</b></a>
                    </div>
                </div>
            </div>
        );
    }
}

export default NewsTab;