import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import './styles.css';

const GOLD = 'gold';
const SILVER = 'silver';
const BRONZE = 'bronze';
const TOTAL = 'total';

const headerKeys = [GOLD, SILVER, BRONZE, TOTAL];
const medalHeaderKeys = headerKeys.slice(0, headerKeys.length - 1);

const MedalDot = ({ kind }) => (
  <span className={`medal-dot medal-dot-${kind}`} />
);

MedalDot.propTypes = {
  kind: PropTypes.oneOf(medalHeaderKeys),
};

const headers = {
  total: { label: 'TOTAL' },
  gold: { label: <MedalDot kind={GOLD} /> },
  silver: { label: <MedalDot kind={SILVER} /> },
  bronze: { label: <MedalDot kind={BRONZE} /> },
};

const CountryFlag = ({ flagPosition }) => (
  <span className="flag-image" style={{ backgroundPosition: flagPosition }} />
);

CountryFlag.propTypes = {
  flagPosition: PropTypes.string.isRequired,
};

const RankingRow = ({
  ranking,
  flagPosition,
  code,
  gold = 0,
  silver = 0,
  bronze = 0,
  total = 0,
}) => (
  <tr>
    <td key="ranking" className="ranking-cell">
      {ranking}
    </td>
    <td key="country-flag">
      <CountryFlag flagPosition={flagPosition} />
    </td>
    <td key="country-code">
      <b>{code}</b>
    </td>
    <td key={GOLD} className="score-cell">
      {gold}
    </td>
    <td key={SILVER} className="score-cell">
      {silver}
    </td>
    <td key={BRONZE} className="score-cell">
      {bronze}
    </td>
    <td key={TOTAL} className="score-cell">
      <b className="total-score-cell">{total}</b>
    </td>
  </tr>
);

RankingRow.propTypes = {
  ranking: PropTypes.number.isRequired,
  flagPosition: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  gold: PropTypes.number,
  silver: PropTypes.number,
  bronze: PropTypes.number,
  total: PropTypes.number,
};

const RankingHead = ({ sortColumn = GOLD, onHeaderClick }) => (
  <tr>
    <th key="ranking" aria-label="Ranking" />
    <th key="country-flag" aria-label="Country flag" />
    <th
      key="country-code"
      aria-label="Country code"
      className="country-code-cell"
    />
    {headerKeys.map((key) => (
      <th
        key={key}
        onClick={() => onHeaderClick(key)}
        className={sortColumn === key ? 'column-header-active' : ''}
      >
        {headers[key].label}
      </th>
    ))}
  </tr>
);

RankingHead.propTypes = {
  sortColumn: PropTypes.oneOf(headerKeys),
  onHeaderClick: PropTypes.func.isRequired,
};

const orderCountries = (countries, sortColumn) =>
  orderBy(
    countries,
    [sortColumn, GOLD, SILVER, BRONZE],
    ['desc', 'desc', 'desc', 'desc']
  );

const Countries = ({ countries, sortColumn }) => {
  const flagPositions = useMemo(() => {
    const countriesByCode = orderBy(countries, 'code');
    return countriesByCode.reduce(
      (positions, { code }, index) => ({
        ...positions,
        [code]: `0 ${index * -17}px`,
      }),
      {}
    );
  }, [countries]);
  return orderCountries(countries, sortColumn)
    .map((country, index) => (
      <RankingRow
        key={country.code}
        ranking={index + 1}
        flagPosition={flagPositions[country.code]}
        {...country}
      />
    ))
    .slice(0, 10);
};

Countries.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  sortColumn: PropTypes.oneOf(headerKeys),
};

const App = ({ defaultSort }) => {
  const [sortColumn, setSortColumn] = useState(defaultSort);
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    fetch(
      'https://s3-us-west-2.amazonaws.com/reuters.medals-widget/medals.json'
    )
      .then((response) => response.json())
      .then((data) => {
        setCountries(
          data.map(({ gold = 0, silver = 0, bronze = 0, ...country }) => ({
            ...country,
            gold,
            silver,
            bronze,
            total: gold + silver + bronze,
          }))
        );
      });
  }, []);
  return (
    <div className="medal-widget">
      <h2>MEDAL COUNT</h2>
      <table>
        <thead>
          <RankingHead sortColumn={sortColumn} onHeaderClick={setSortColumn} />
        </thead>
        <tbody>
          <Countries sortColumn={sortColumn} countries={countries} />
        </tbody>
      </table>
    </div>
  );
};

App.propTypes = {
  defaultSort: PropTypes.oneOf(medalHeaderKeys),
};

export default App;
