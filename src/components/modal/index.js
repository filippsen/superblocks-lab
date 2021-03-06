// Copyright 2018 Superblocks AB
//
// This file is part of Superblocks Lab.
//
// Superblocks Lab is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation version 3 of the License.
//
// Superblocks Lab is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Superblocks Lab.  If not, see <http://www.gnu.org/licenses/>.

import { h, Component } from 'preact';
import classnames from 'classnames';
import style from './style';

export default class Modal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const style_explicit=this.props.data.style || {};
        const cls={};
        cls[style.modal]=true;
        if(this.props.data.class) {
            cls[this.props.data.class]=true;
        }
        return (
            <div className={classnames(cls)} style={style_explicit}>
                <h2 class={style.title}>{this.props.data.title}</h2>
                <div class={style.body}>{this.props.data.body}</div>
            </div>);
    }
}
