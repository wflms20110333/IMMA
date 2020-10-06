package com.example.browserbugandroid.ui.myaccount;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.example.browserbugandroid.R;

public class MyAccountFragment extends Fragment {
    Context context;
    SharedPreferences sharedPref;
    SharedPreferences.Editor editor;

    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        context = getContext();
        View root = inflater.inflate(R.layout.fragment_my_account, container, false);

        Button resetButton = (Button) root.findViewById(R.id.reset_app);
        resetButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Clear up sharedPref
                sharedPref = getActivity().getSharedPreferences("BBugPref", Context.MODE_MULTI_PROCESS);
                editor = sharedPref.edit();
                editor.clear();
                editor.commit();

                Toast.makeText(context, "Successfully reset!", Toast.LENGTH_SHORT).show();

                NavController navController = Navigation.findNavController(getActivity(), R.id.nav_host_fragment);
                navController.navigate(R.id.nav_options);
            }
        });

        Button backButton = (Button) root.findViewById(R.id.acc_back_button);
        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                NavController navController = Navigation.findNavController(getActivity(), R.id.nav_host_fragment);
                navController.navigate(R.id.nav_options);
            }
        });

        return root;
    }
}