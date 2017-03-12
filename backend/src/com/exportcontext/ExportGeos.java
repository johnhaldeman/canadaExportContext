package com.exportcontext;

import java.io.IOException;
import java.io.PrintWriter;
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
 * Servlet implementation class ExportGeos
 */
@WebServlet("/services/ExportGeos")
public class ExportGeos extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ExportGeos() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
		response.setContentType("application/json");
		
		String yearStr = request.getParameter("year");
		String territory = request.getParameter("territory");
		String includeUSStr = request.getParameter("include_us");
		boolean includeUS = false;
		
		if(yearStr == null || territory == null || includeUSStr == null){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		
		if(yearStr.matches("[0-9]+") && includeUSStr.matches("true|false")){
			includeUS = includeUSStr.equals("true");
		}
		else{
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		
		InitialContext cxt;
		try {
			cxt = new InitialContext();
			DataSource ds = (DataSource) cxt.lookup( "java:/comp/env/jdbc/postgres" );
			Connection conn = ds.getConnection();
			
			PrintWriter wr = response.getWriter();
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			
			String sql = "";
			
			PreparedStatement stmt;
			if(territory.equals("World")){
				if(includeUS)
					sql = "select country_code, value, country_label || ': $' || to_char((value /1000000), '999,999,999') || ' million' " //, year, territory_text "
							+ "from geo_world_precomp "
							+ "where year = ?";
				else
					sql = "select country_code, value, country_label || ': $' || to_char((value /1000000), '999,999,999') || ' million'  " //, year, territory_text "
							+ "from geo_world_precomp "
							+ "where year = ? "
							+ "and country_code <> 'US'";
				stmt = conn.prepareStatement(sql);
			}
			else if(territory.equals("US")){
				sql = "select state_code, value, state_label || ': $' || to_char((value /1000000), '999,999,999') || ' million'  " //, year, territory_text "
						+ "from geo_us_precomp "
						+ "where year = ?";
				stmt = conn.prepareStatement(sql);
			}
			else{
				sql = "select country_code, value, country_label  || ': $' || to_char((value /1000000), '999,999,999') || ' million'  " //, year, territory_text "
						+ "from geo_world_precomp "
						+ "where year = ? "
						+ "and territory_text = ?";
				stmt = conn.prepareStatement(sql);

				stmt.setString(2, territory);
			}

			stmt.setString(1, yearStr);
			
			ResultSet rs = stmt.executeQuery();
			
			ResultSetMetaData md = rs.getMetaData();
			String[] collHeader = new String[md.getColumnCount()];
			
			for(int i = 1; i <= md.getColumnCount(); i++){
				collHeader[i - 1] = md.getColumnLabel(i);
			}
			wr.println("{\n\"data\": [");
			wr.print(gson.toJson(collHeader));
			
			long totalVal = 0; 
			while(rs.next()){
				wr.println(",");
				Object[] data = new Object[md.getColumnCount()];
				for(int i = 1; i <= md.getColumnCount(); i++){
					if(rs.getObject(i) == null)
						data[i - 1] = rs.getObject(i);
					else if(rs.getObject(i).getClass() == String.class)
						data[i - 1] = rs.getObject(i).toString().trim();
					else
						data[i - 1] = rs.getObject(i);
					
					
				}
				
				totalVal += rs.getLong("value");
				wr.print(gson.toJson(data));
			}
			wr.println("], \n\"total\": " + totalVal );
			stmt.close();
			
			String grandTotalSQL = "select sum(value) as value from geo_world_precomp "
					+ "where year = ?";
			
			stmt = conn.prepareStatement(grandTotalSQL);
			stmt.setString(1, yearStr);
			ResultSet grandTotalResult = stmt.executeQuery();
			grandTotalResult.next();
			wr.println(", \"grand_total\": " + grandTotalResult.getLong("value") );
		
			wr.println("}");
			
			rs.close();
			stmt.close();
			conn.close();
		} catch (NamingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
