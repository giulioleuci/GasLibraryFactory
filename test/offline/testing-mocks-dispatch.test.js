import { DocumentBuilder } from '../../GoogleApiWrapper/src/services/DocumentBuilder.js';
import { DocumentServiceMock } from '../../GoogleApiWrapper/src/testing/mocks.js';
import { AdvancedQueryBuilder } from '../../SheetDBLib/src/query/AdvancedQueryBuilder.js';
import { DatabaseServiceMock } from '../../SheetDBLib/src/testing/mocks.js';

test('testing service mocks dispatch to the production builders', () => {
  const builder = new DocumentServiceMock().document('doc-id');

  expect(builder).toBeInstanceOf(DocumentBuilder);
  expect(builder.createTable([[1]]).execute()).toMatchObject({
    success: true,
    tableResults: [{ operation: 'createTable', result: { success: true, rows: 1, columns: 1 } }]
  });
  expect(new DatabaseServiceMock().select()).toBeInstanceOf(AdvancedQueryBuilder);
});
