package com.exportcontext;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Servlet implementation class JDBCTest
 */
@WebServlet("/ExportProportions")
public class ExportProportions extends HttpServlet {
	private static final long serialVersionUID = 1L;

    /**
     * Default constructor. 
     */
    public ExportProportions() {
    }
    
    public String getTitle(String desc, String level, int offset, int max, int year){
    	String title = Integer.toString(year);
    	String newDesc = "";
    	
    	if(desc == null)
    		desc = "All Exports";
    	
    	final int descLimit = 100;
    	if(desc.length() < descLimit){
    		newDesc = desc;
    	}
    	else{
    		newDesc = desc.substring(0, descLimit).trim() + "...";
    	}
    	
    	if(level.equals("2"))
    		title = "HS-2 (High Level) Data";
    	else if(level.equals("4")){
    		title = "HS-4 (Mid Level) Data for " + newDesc;    		
    	}
    	else{
    		title = "HS-6 (Low Level) Data for " + newDesc;    		
    	}
    	
    	title += " Top " + offset + " to " + max + " Categories";
    	
    	return title;
    	
    }
    
    public String getDrillDownURI(String desc, String origDesc, String level, int max, int year) throws UnsupportedEncodingException{
    	String linkLevel = "2";
    	String newDesc = "";
    	
    	if(desc.equals("Other")){
    		linkLevel = level;
        	int newOffset = max + 1;
        	int newMax = newOffset + 9;
        	if(origDesc != null){
        		newDesc=URLEncoder.encode(origDesc, "UTF-8");
        		return "ExportProportions?year="+year+"&offset="+ newOffset +"&max=" + newMax + "&level="+linkLevel+"&query=" + newDesc;
        	}
        	else
        		return "ExportProportions?year="+year+"&offset="+ newOffset +"&max=" + newMax + "&level="+linkLevel;
    	}
    	else{
    		if(level.equals("6")){
        		return "";
        	}
    		newDesc=URLEncoder.encode(desc, "UTF-8");
        	if(level.equals("2"))
        		linkLevel = "4";
        	else if(level.equals("4"))
        		linkLevel = "6";
    		return "ExportProportions?year="+year+"&offset=0&max=10&level="+linkLevel+"&query=" + newDesc;
    	}
    	
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
		response.setContentType("application/json");
		
		InitialContext cxt;
		try {
			cxt = new InitialContext();

			DataSource ds = (DataSource) cxt.lookup( "java:/comp/env/jdbc/postgres" );
			Connection conn = ds.getConnection();
			
			PrintWriter wr = response.getWriter();
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			String yearStr = request.getParameter("year");
			int year;
			String offsetStr = request.getParameter("offset");
			int offset;
			String maxStr = request.getParameter("max");
			int max;
			String level = request.getParameter("level");
			String query = request.getParameter("query");
			
			if(yearStr == null || offsetStr == null || maxStr == null || level == null){
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			
			if(yearStr.matches("[0-9]+") && 
					offsetStr.matches("[0-9]+") && 
					maxStr.matches("[0-9]+") &&
					level.matches("[246]")
					){
				year = Integer.parseInt(yearStr);
				offset = Integer.parseInt(offsetStr);
				max = Integer.parseInt(maxStr);
			}
			else{
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			
			if((level.equals("4") || level.equals("6")) && query == null){
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
			
			
			final String hs2Select = 	
					"WITH summary AS ( \n" +
					"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
					"    FROM (\n" +
					"        SELECT HS_2_DESC as desc, SUM(VALUE) AS value\n" +
					"	 FROM HS2_PRECOMP\n" +
					"        WHERE YEAR = ?\n" +
					"        GROUP BY HS_2_DESC\n" +
					"    ) p\n" +
					"),\n" +
					"total AS(\n" +
					"    SELECT SUM(VALUE) as value\n" +
					"    FROM HS2_PRECOMP\n" +
					"    WHERE YEAR = ?\n" +
					")\n" +
					"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
					"  FROM summary s1, total t1\n" +
					"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
					"UNION ALL\n" +
					"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
					"    FROM summary s2, total t2\n" +
					"   WHERE s2.rank > ?\n" +
					"  GROUP BY t2.value\n" +
					"ORDER BY rank ";
			
			final String hs4Select = 	
					"WITH summary AS ( \n" +
					"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
					"    FROM (\n" +
					"        SELECT HS_4_DESC as desc, SUM(VALUE) AS value\n" +
					"	 FROM HS4_PRECOMP\n" +
					"        WHERE YEAR = ?\n" +
					"        AND HS_2_DESC=?\n" +
					"        GROUP BY HS_4_DESC\n" +
					"    ) p\n" +
					"),\n" +
					"total AS(\n" +
					"    SELECT SUM(VALUE) as value\n" +
					"    FROM HS4_PRECOMP\n" +
					"    WHERE YEAR = ?\n" +
					"    AND HS_2_DESC=?\n" +
					")\n" +
					"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
					"  FROM summary s1, total t1\n" +
					"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
					"UNION ALL\n" +
					"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
					"    FROM summary s2, total t2\n" +
					"   WHERE s2.rank > ?\n" +
					"  GROUP BY t2.value\n" +
					"ORDER BY rank ";
			
			final String hs6Select = 	
					"WITH summary AS ( \n" +
					"    SELECT p.*, ROW_NUMBER() OVER (ORDER BY p.value DESC) AS rank\n" +
					"    FROM (\n" +
					"        SELECT HS_6_DESC as desc, SUM(VALUE) AS value\n" +
					"	 FROM HS6_PRECOMP\n" +
					"        WHERE YEAR = ?\n" +
					"        AND HS_4_DESC=?\n" +
					"        GROUP BY HS_6_DESC\n" +
					"    ) p\n" +
					"),\n" +
					"total AS(\n" +
					"    SELECT SUM(VALUE) as value\n" +
					"    FROM HS6_PRECOMP\n" +
					"    WHERE YEAR = ?\n" +
					"    AND HS_4_DESC=?\n" +
					")\n" +
					"  SELECT s1.desc, s1.value, s1.value/t1.value as percent, s1.rank\n" +
					"  FROM summary s1, total t1\n" +
					"  WHERE s1.rank <= ? and s1.rank >= ?\n" +
					"UNION ALL\n" +
					"  SELECT 'Other', SUM(s2.value), SUM(s2.value)/t2.value as percent, ? + 1\n" +
					"    FROM summary s2, total t2\n" +
					"   WHERE s2.rank > ?\n" +
					"  GROUP BY t2.value\n" +
					"ORDER BY rank ";
			
			PreparedStatement stmt;
			
			if(level.equals("6")){
				stmt = conn.prepareStatement(hs6Select);
				
				stmt.setInt(1, year);
				stmt.setString(2, query);
				stmt.setInt(3, year);
				stmt.setString(4, query);
				stmt.setInt(5, max);
				stmt.setInt(6, offset);
				stmt.setInt(7, max);
				stmt.setInt(8, max);
				
			}
			else if(level.equals("4")){
				stmt = conn.prepareStatement(hs4Select);
				
				stmt.setInt(1, year);
				stmt.setString(2, query);
				stmt.setInt(3, year);
				stmt.setString(4, query);
				stmt.setInt(5, max);
				stmt.setInt(6, offset);
				stmt.setInt(7, max);
				stmt.setInt(8, max);
			}
			else{
				stmt = conn.prepareStatement(hs2Select);
				
				stmt.setInt(1, year);
				stmt.setInt(2, year);
				stmt.setInt(3, max);
				stmt.setInt(4, offset);
				stmt.setInt(5, max);
				stmt.setInt(6, max);				
			}

			
			
			ResultSet rs = stmt.executeQuery();
			
			
			ResultSetMetaData md = rs.getMetaData();
			String[] collHeader = new String[md.getColumnCount() + 1];
			collHeader[collHeader.length - 1] = "drillDownURI";
			
			for(int i = 1; i <= md.getColumnCount(); i++){
				collHeader[i - 1] = md.getColumnLabel(i);
			}
			wr.println("{ \"title\":" + gson.toJson(getTitle(query, level, offset, max, year))
					+ ", \n\"data\": [");
			wr.println(gson.toJson(collHeader));
			
			long totalVal = 0; 
			
			while(rs.next()){
				wr.print(",");
				
				Object[] data = new Object[md.getColumnCount() + 1];
				String desc = rs.getString("desc");				
				String drillURI = getDrillDownURI(desc, query, level, max, year);
				data[data.length - 1] = drillURI;
				
				for(int i = 1; i <= md.getColumnCount(); i++){
					data[i - 1] = rs.getObject(i);
				}
				wr.println(gson.toJson(data));
				
				totalVal += rs.getLong("value");
				
			}
			wr.println("], \"total\": " + totalVal + "}");
			
			rs.close();
			stmt.close();
			conn.close();
		} catch (NamingException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
