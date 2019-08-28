import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';
import api from '../../service/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, Pagination, Filters } from './styles';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    filter: 'all',
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 30,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleChangeFilter = async filterName => {
    await this.setState({ filter: filterName });
    this.loadIssues();
  };

  loadIssues = async () => {
    const { match } = this.props;
    const { page, filter } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filter,
        per_page: 30,
        page,
      },
    });

    this.setState({
      issues: issues.data,
    });
  };

  handlePrevPage = async () => {
    const { page } = this.state;
    await this.setState({ page: page - 1 });
    this.loadIssues();
  };

  handleNextPage = async () => {
    const { page } = this.state;
    await this.setState({ page: page + 1 });
    this.loadIssues();
  };

  render() {
    const { repository, issues, loading, page, filter } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueList>
          <Filters type={filter}>
            <button
              className="all"
              type="button"
              onClick={() => this.handleChangeFilter('all')}
            >
              All
            </button>
            <button
              className="open"
              type="button"
              onClick={() => this.handleChangeFilter('open')}
            >
              Open
            </button>
            <button
              className="closed"
              type="button"
              onClick={() => this.handleChangeFilter('closed')}
            >
              Closed
            </button>
          </Filters>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <button
            img={FaChevronCircleLeft}
            type="button"
            disabled={page < 2}
            onClick={this.handlePrevPage}
          >
            <FaChevronCircleLeft
              color={page < 2 ? '#222' : '#7150c1'}
              size={25}
            />
          </button>
          <span>Página {page}</span>
          <button type="button" onClick={this.handleNextPage}>
            <FaChevronCircleRight color="#7150c1" size={25} />
          </button>
        </Pagination>
      </Container>
    );
  }
}

export default Repository;
