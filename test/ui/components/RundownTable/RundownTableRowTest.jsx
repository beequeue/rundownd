import React, {PropTypes} from 'react';
import {shallow} from 'enzyme';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import RundownTableRow from '../../../../src/ui/components/RundownTable/TableRow.jsx'

chai.use(chaiEnzyme());

describe('RundownTableRow', () => {

  var item = {
    isHidden: false,
    cols: [
      'first',
      'second',
      'third'
    ],
    collapses: [true, true, false]
  };

  it('should contain 3 columns', () => {
    const row = shallow(<RundownTableRow item={item}/>);
    const columns = row.find('td');
    expect(columns).to.have.length.of(3);
  });

  it('should have correct values in the columns', () => {
    const row = shallow(<RundownTableRow item={item}/>);
    const columns = row.find('td');
    expect(columns.at(0)).to.have.text('first');
    expect(columns.at(1)).to.have.text('second');
    expect(columns.at(2)).to.have.text('third');
  });

  it('should have collapsed class for collapsing values', () => {
    const row = shallow(<RundownTableRow item={item}/>);
    const columns = row.find('td');
    expect(columns.at(0)).to.have.className('collapsed');
    expect(columns.at(1)).to.have.className('collapsed');
    expect(columns.at(2)).to.not.have.className('collapsed');
  });

  it('should not have hidden class when isHidden is false', () => {
    const row = shallow(<RundownTableRow item={item}/>);
    const tr = row.find('tr');
    expect(tr).to.not.have.className('hidden');
  });

  it('should have hidden class when isHidden is true', () => {
    const hiddenItem = item;
    hiddenItem.isHidden = true;
    const row = shallow(<RundownTableRow item={hiddenItem}/>);
    const tr = row.find('tr');
    expect(tr).to.have.className('hidden');
  });

});