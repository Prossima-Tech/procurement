import React from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { useTheme } from '../../contexts/ThemeContext';

const Table = ({ columns, data }) => {
  const { isDarkMode } = useTheme();
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <table {...getTableProps()} className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />
                        : <ChevronUpIcon className="w-4 h-4 inline-block ml-1" />
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sm:px-6`}>
        <div className="flex-1 flex justify-between sm:hidden">
          <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
            Previous
          </Button>
          <Button onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Showing <span className="font-medium">{page.length}</span> of{' '}
              <span className="font-medium">{data.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                First
              </Button>
              <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                Previous
              </Button>
              <Button onClick={() => nextPage()} disabled={!canNextPage}>
                Next
              </Button>
              <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                Last
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;