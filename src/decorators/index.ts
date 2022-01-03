import { Inject } from '@nestjs/common';

import { getModelToken, getConnectionsToken } from '../utils';

export const InjectModel = (model: string) => Inject(getModelToken(model));

export const InjectConnections = () => Inject(getConnectionsToken());
