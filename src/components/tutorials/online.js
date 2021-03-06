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
import style from './style';

export default class TutorialsOnline extends Component {
    constructor(props) {
        super(props);
        this.id=props.id+"_tutorial_online";
    }

    redraw = () => {
        this.setState();
    };

    render() {
        return (<div id={this.id} class={style.main}>
                <div class="scrollable-y" id={this.id+"_scrollable"}>
                    <iframe src="https://superblocks.com/studio/tutorials/"></iframe>
                </div>
                </div>);
    }
}
