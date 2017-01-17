import React, { Component } from 'react';

class HorizantalScrollList extends Component {

    componentDidMount () {
        const { classNameValue } = this.props;
        this.element = document.querySelector(`.${classNameValue}`);
    }
    

    onMousedownScrollList = (event) => {
        event.preventDefault();
        this.scrollListScrollDown = true;
        this.scrollListScrollX = event.pageX;
        this.scrollListScrollLeft =  this.element.scrollLeft;
    };
    onMousemoveScrollList = (event) => {
        if (this.scrollListScrollDown) {
            const newscrollListScrollX = event.pageX;
            this.element.scrollLeft = this.scrollListScrollLeft - newscrollListScrollX + this.scrollListScrollX;
        }
    };
    onMouseupScrollList = () => this.scrollListScrollDown = false;

    render() {
        const { classNameValue } = this.props;

        return (
            <ul className={`list-inline horizontal-scroll ${classNameValue}`} onMouseDown={this.onMousedownScrollList.bind(this)} onMouseUp={this.onMouseupScrollList.bind(this)} onMouseMove={this.onMousemoveScrollList.bind(this)}>
                {this.props.children}
            </ul>
        );
    }
}

export default HorizantalScrollList;