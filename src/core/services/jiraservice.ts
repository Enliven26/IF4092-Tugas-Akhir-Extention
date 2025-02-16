import { HttpException, Version2Client } from "jira.js";

export const getJiraTicketContentAsync = async (jiraUrl: string, jiraTicketIds: string[]): Promise<string[]> => {
    const client = new Version2Client({
        host: jiraUrl,
      });
    
      const results: string[] = [];
    
      for (const ticketId of jiraTicketIds) {
        try {
          const issue = await client.issues.getIssue({ issueIdOrKey: ticketId });

          if (issue.key !== ticketId) {
            continue;
          }
  
          results.push(issue.fields.summary);
        }
        catch (error: any) {
          if (error instanceof HttpException)
          {
            if (error.status === 404) {
              continue;
            }
          }

          throw error;
        }
      }
    
      return results;
};

export const isJiraUrlValidAsync = async (jiraUrl: string): Promise<boolean> => {
  try {
    const client = new Version2Client({
      host: jiraUrl,
    });
    await client.serverInfo.getServerInfo();
    return true;
  } catch (error: any) {
    return false;
  }
};