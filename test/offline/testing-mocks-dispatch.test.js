import { DocumentBuilder } from '../../GoogleApiWrapper/src/services/DocumentBuilder.js';
import { DocumentServiceMock } from '../../GoogleApiWrapper/src/testing/mocks.js';
import { AdvancedQueryBuilder } from '../../SheetDBLib/src/query/AdvancedQueryBuilder.js';
import { DatabaseServiceMock } from '../../SheetDBLib/src/testing/mocks.js';

test('testing service mocks dispatch to the production builders', () => {
  expect(new DocumentServiceMock().document('doc-id')).toBeInstanceOf(DocumentBuilder);
  expect(new DatabaseServiceMock().select()).toBeInstanceOf(AdvancedQueryBuilder);
});
