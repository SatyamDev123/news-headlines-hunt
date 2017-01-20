import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import './style.scss';
import Loading from '../../components/Loading';
import shallowCompare from 'preact-shallow-compare';
import FACEBOOK_SHARE from './facebook_share.png';
import TWITTER_SHARE from './twitter_share.png';

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
        window.scroll(0,0);
    }

    dateToStr (date) {
        let date_milliseconds = new Date(date).getTime();
        date = (date && !date.includes('0001-01-01')) ? date : null;
        if(date && !isNaN(date_milliseconds)){
            // TIP: to find current time in milliseconds, use:
            let  current_time_milliseconds = new Date().getTime();
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
    }

    shareToFacebook(shareUrl, event) {
        if (typeof(FB) != 'undefined' && FB != null ) {
            FB.ui({
                method: 'share',
                href: shareUrl,
            }, function(response){
                if (response && !response.error_message) {
                    console.log('Posting completed.');
                } else {
                    console.log('Error while posting.');
                }
            });
        }
        event.preventDefault();
    }

  
    render() {
        const { isSortByOpen, loadingNews, sortByValueList, newsList, sortByValue } = this.state;
        const { selectedSource, nextSelectSource, onSourceChange } = this.props;

        return (
            <main className="nhh__content">
                <div className="nhh__content__header container">
                    {
                        (!loadingNews || isSortByOpen) &&
                            <div className="sortBy-btn-list">
                                {
                                    sortByValueList.map((sort,index)=>
                                        <button style={index && `border-left:none`} className={sort===sortByValue ? 'active' : ''} onClick={this.onSortByChange.bind(this, sort)}>{sort}</button>
                                    )
                                }
                            </div>
                    }
                </div>
                <article className="container"> 
                    <div className="nhh__content__articles">
                        {
                            loadingNews ? <Loading /> : newsList.map((news, index)=>
                                <a href={news.url} target="_blank" key={`news${index}`} className="news-article-link nhh__content__article-card nhh-card">
                                    <div style={`background-image:url(${news.urlToImage || selectedSource.urlsToLogos.medium})`}  className="nhh-card__content__image">
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
                                    <div className="article-social-share text-center">
                                        <button onClick={this.shareToFacebook.bind(this, news.url)}>Share <img src={FACEBOOK_SHARE} /></button>
                                        <a class="btn"  href={`https://twitter.com/intent/tweet?text=${news.url}`}>Tweet <img src={TWITTER_SHARE} /></a>
                                    </div>
                                </a>
                            )
                        }
                    </div>
                </article>
                <div className="nhh__content__footer container">
                    {
                        (!loadingNews || isSortByOpen) && sortByValueList.length > 1 &&
                            <div className="sortBy-btn-list hide-md clearfix">
                                {
                                    sortByValueList.map(sort=>
                                        <button className={sort===sortByValue ? 'active' : ''} onClick={this.onSortByChange.bind(this, sort)}>{sort}</button>
                                    )
                                }
                            </div>
                    }
                    <div>
                        {
                            nextSelectSource.name && <button onClick={onSourceChange.bind(this, nextSelectSource, true)}>Next {nextSelectSource.name}</button>
                        }
                    </div>
                </div>
            </main>
        );
    }
}

export default NewsTab;