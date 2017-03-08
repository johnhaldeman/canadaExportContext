package com.exportcontext;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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
@WebServlet("/ExportTerritories")
public class ExportTerritories extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ExportTerritories() {
        super();
        // TODO Auto-generated constructor stub
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
			
			PreparedStatement stmt = conn.prepareStatement("select 'World' as territory_text UNION "
					+ "select distinct territory_text from geos where territory_text is not null order by territory_text desc");
			ResultSet rs = stmt.executeQuery();
			
			wr.print("[");
			boolean first = true;
			while(rs.next()){
				if(first)
					first=false;
				else
					wr.println(",");
				wr.print(gson.toJson(rs.getString("territory_text").trim()));
			}
			wr.println("]");
			
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
