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
        const { selectedSource, countryNameWithCode } = this.props;

        return (
            <main className="nhh__content">
                <div className="nhh__content__header container">
                    {
                        (!loadingNews || isSortByOpen) &&
                            <div className="sortBy-btn-list">
                                {
                                    sortByValueList.map(sort=>
                                        <button className={sort===sortByValue ? 'active' : ''} onClick={this.onSortByChange.bind(this, sort)}>{sort}</button>
                                    )
                                }
                            </div>
                    }
                </div>
                <article className="container"> 
                    <div className="nhh__content__articles">
                        {
                            loadingNews ? <Loading /> : newsList.map((news, index)=>
                                <a href={news.url} target="blank" key={`news${index}`} className="news-article-link nhh__content__article-card nhh-card">
                                    <div style={`background-image:url(${news.urlToImage})`}  className="nhh-card__content__image">
                                    </div>
                                    <section className="nhh-card__content__details">
                                        <div className="clearfix">
                                            <span className="text-muted u-pull-left">{selectedSource.name}</span>
                                            <span className="text-muted u-pull-right">{this.dateToStr(news.publishedAt)}</span>
                                        </div>
                                        <div>
                                            <h3>{news.title}</h3>
                                            <p>{news.description}</p>
                                        </div>
                                    </section>
                                </a>
                            )
                        }
                    </div>
                </article>
                <div className="nhh__content__header container show-md">
                    {
                        (!loadingNews || isSortByOpen) &&
                            <div className="sortBy-btn-list">
                                {
                                    sortByValueList.map(sort=>
                                        <button className={sort===sortByValue ? 'active' : ''} onClick={this.onSortByChange.bind(this, sort)}>{sort}</button>
                                    )
                                }
                            </div>
                    }
                </div>
            </main>
        );
    }
}

export default NewsTab;