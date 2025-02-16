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
  
          const summary = issue.fields.summary;
          const issueType = issue.fields.issuetype ? issue.fields.issuetype.name : "N/A";
          const priority = issue.fields.priority ? issue.fields.priority.name : "N/A";
          const description = issue.fields.description || "No description provided.";

          const formattedIssue = `Ticket ID: ${issue.key}
Issue Summary: ${summary}
Issue Type: ${issueType}
Priority: ${priority}

Description:
${description}`;

          results.push(formattedIssue);
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