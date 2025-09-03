import { getRequestClient } from './RequestHelper';

export class TeamConfigHelper {
  static async exportConfig(teamId: string, token: string) {
    const client = getRequestClient(token);
    const url = client.getUrl(`/api/team-config/export/${teamId}`);
    const response = await client.fetchWithTimeout(url, client.getHeaderWithAuthentication('POST'));
    return client.parseJson(response);
  }

  static async applyConfig(configId: string, teamId: string, token: string) {
    const client = getRequestClient(token);
    const url = client.getUrl('/api/team-config/apply');
    const response = await client.fetchWithTimeout(
      url,
      {
        ...client.getHeaderWithAuthentication('POST'),
        body: JSON.stringify({ configId, teamId }),
      }
    );
    return client.parseJson(response);
  }

  static async listConfigs(token: string) {
    const client = getRequestClient(token);
    const url = client.getUrl('/api/team-config/list');
    const response = await client.fetchWithTimeout(url, client.getHeaderWithAuthentication('GET'));
    return client.parseJson(response);
  }

  static async deleteConfig(configId: string, token: string) {
    const client = getRequestClient(token);
    const url = client.getUrl(`/api/team-config/${configId}`);
    const response = await client.fetchWithTimeout(url, client.getHeaderWithAuthentication('DELETE'));
    return client.parseJson(response);
  }
}
